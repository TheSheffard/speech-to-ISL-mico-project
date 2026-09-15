import { useState, useRef, useCallback } from "react";

// Environment-based API configuration
const API_BASE_URL = import.meta.env.PROD
  ? "https://soundsigns.onrender.com"
  : " http://127.0.0.1:5000";

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState("");
  const [isl, setIsl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(""); // NEW: shows exactly what's happening
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const isStoppingRef = useRef(false); // prevents double-trigger on stop

  // ── Translation call ────────────────────────────────────────────
  const translateText = useCallback(async (text) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setProcessingStatus("Sending to AI..."); // Step 1 feedback

    try {
      setProcessingStatus("Translating to ISL gloss..."); // Step 2 feedback

      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) throw new Error(`Backend error: ${response.status}`);

      setProcessingStatus("Building sign sequence..."); // Step 3 feedback

      const data = await response.json();
      data.isl = data.isl.replace(/"/g, "");
      setIsl(data.isl);
      setProcessingStatus("Done!");

      // Clear status after short delay
      setTimeout(() => setProcessingStatus(""), 1000);
    } catch (err) {
      console.error("Translation error:", err);
      setIsl("Translation failed. Please try again.");
      setProcessingStatus("Failed — try again");
      setTimeout(() => setProcessingStatus(""), 2000);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // ── Start recording ─────────────────────────────────────────────
  const startRecording = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
      return;
    }

    // Reset state
    finalTranscriptRef.current = "";
    isStoppingRef.current = false;
    setTranscript("");
    setIsl("");
    setProcessingStatus("");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = true;  // show words as you speak
    recognition.continuous = true;       // keep listening until manually stopped
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onerror = (event) => {
      // "aborted" fires when we manually stop — ignore it
      if (event.error === "aborted") return;
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      setIsProcessing(false);
      setProcessingStatus("");
    };

    // ── onresult: fires constantly while you speak ──────────────
    recognition.onresult = (event) => {
      let interimTranscript = "";
      let newFinalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinalTranscript += result;
        } else {
          interimTranscript += result;
        }
      }

      // Accumulate confirmed words
      if (newFinalTranscript) {
        finalTranscriptRef.current += newFinalTranscript;
      }

      // Show confirmed + in-progress words immediately
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    // ── onend: fires after stop() is called ────────────────────
    recognition.onend = () => {
      setIsRecording(false);

      // Only translate if we stopped intentionally (not due to error)
      if (!isStoppingRef.current) return;

      const finalText = finalTranscriptRef.current.trim();
      if (finalText) {
        translateText(finalText);
      }
    };

    recognition.start();
  }, [translateText]);

  // ── Stop recording ──────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    isStoppingRef.current = true; // mark as intentional stop
    setIsRecording(false);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  // ── Toggle ──────────────────────────────────────────────────────
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    transcript,
    isl,
    isRecording,
    isProcessing,
    processingStatus, // NEW — pass this down to show in UI
    toggleRecording,
    startRecording,
    stopRecording,
  };
};