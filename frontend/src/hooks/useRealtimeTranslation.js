import { useState, useRef, useCallback, useEffect } from "react";

const API_BASE_URL = "https://speech-to-sign-language-backend-psi.vercel.app";

/*
  Real-time speech → ISL.

  Key idea: translate per UTTERANCE, not per word. ISL reorders across a whole
  clause ("...meeting tomorrow" -> "TOMORROW MEETING..."), so translating single
  words as they arrive produces fluent-looking but ungrammatical gloss. Chrome's
  SpeechRecognition marks utterance boundaries with `isFinal` when the speaker
  pauses — that's our translation unit.

  Segments are translated one at a time, in order, and appended to a growing
  gloss string so the video player can keep signing without restarting.
*/

const RESTART_DELAY_MS = 250; // Chrome auto-stops on silence; we restart

export const useRealtimeTranslation = () => {
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isl, setIsl] = useState("");            // accumulated gloss (append-only)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);   // user intent, survives auto-restarts
  const queueRef = useRef([]);             // utterances waiting to translate
  const drainingRef = useRef(false);
  const abortRef = useRef(null);

  /* ── Translate one utterance ──────────────────────────────── */
  const translateSegment = useCallback(async (text) => {
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Backend error: ${res.status}`);

      const data = await res.json();
      const gloss = (data.isl || "").replace(/"/g, "").trim();
      if (gloss) {
        // Append — never replace. The player treats this as a continuation.
        setIsl((prev) => (prev ? `${prev} ${gloss}` : gloss));
      }
      setError("");
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Translation error:", err);
      setError("Translation failed for one phrase — still listening.");
    }
  }, []);

  /* ── Drain the queue strictly in order ────────────────────── */
  const drainQueue = useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;
    setIsTranslating(true);

    while (queueRef.current.length > 0) {
      const next = queueRef.current.shift();
      setPendingCount(queueRef.current.length);
      await translateSegment(next);
    }

    drainingRef.current = false;
    setIsTranslating(false);
    setPendingCount(0);
  }, [translateSegment]);

  const enqueue = useCallback(
    (text) => {
      const clean = text.trim();
      if (!clean) return;

      queueRef.current.push(clean);
      setPendingCount(queueRef.current.length);
      drainQueue();
    },
    [drainQueue]
  );

  /* ── Build a recognition session ──────────────────────────── */
  const buildRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition needs Chrome or Edge.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setError("");
    };

    recognition.onresult = (event) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          // Utterance boundary — this is our translation unit.
          setFinalTranscript((prev) => (prev ? `${prev} ${chunk.trim()}` : chunk.trim()));
          enqueue(chunk);
        } else {
          interim += chunk;
        }
      }

      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setError("Microphone permission denied.");
        shouldListenRef.current = false;
        setIsRecording(false);
      }
    };

    // Chrome ends the session after a few seconds of silence even with
    // continuous = true. Restart it so listening feels uninterrupted.
    recognition.onend = () => {
      if (!shouldListenRef.current) {
        setIsRecording(false);
        return;
      }
      setTimeout(() => {
        if (!shouldListenRef.current) return;
        try {
          recognitionRef.current = buildRecognition();
          recognitionRef.current && recognitionRef.current.start();
        } catch (e) {
          console.error("Restart failed:", e);
          setIsRecording(false);
        }
      }, RESTART_DELAY_MS);
    };

    return recognition;
  }, [enqueue]);

  /* ── Controls ─────────────────────────────────────────────── */
  const startListening = useCallback(() => {
    if (shouldListenRef.current) return;

    setFinalTranscript("");
    setInterimTranscript("");
    setIsl("");
    setError("");
    queueRef.current = [];
    setPendingCount(0);

    shouldListenRef.current = true;
    const recognition = buildRecognition();
    if (!recognition) {
      shouldListenRef.current = false;
      return;
    }
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Start failed:", e);
      shouldListenRef.current = false;
    }
  }, [buildRecognition]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (shouldListenRef.current) stopListening();
    else startListening();
  }, [startListening, stopListening]);

  const clearSession = useCallback(() => {
    setFinalTranscript("");
    setInterimTranscript("");
    setIsl("");
    queueRef.current = [];
    setPendingCount(0);
  }, []);

  /* Tear down on unmount */
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) recognitionRef.current.stop();
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const transcript = [finalTranscript, interimTranscript]
    .filter(Boolean)
    .join(" ");

  return {
    transcript,
    finalTranscript,
    interimTranscript,
    isl,
    isRecording,
    isTranslating,
    isProcessing: isTranslating,           // alias: matches existing components
    processingStatus: isTranslating
      ? pendingCount > 0
        ? `Translating (${pendingCount} queued)…`
        : "Translating…"
      : "",
    pendingCount,
    error,
    toggleRecording,
    startListening,
    stopListening,
    clearSession,
  };
};
