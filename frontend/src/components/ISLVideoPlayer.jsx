import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Download } from "lucide-react";
import { processISLTranslation, getVideoSource } from "./videoUtils";
import { createDefaultFilename, downloadCombinedVideo } from "./downloadUtils";
import DownloadModal from "./DownloadModal";

/* ────────────────────────────────────────────────────────────────
   Playback tuning — adjust these to taste.

   Fingerspelled letters are usually recorded with the hand rising
   from rest and settling back at the end. Playing them at 1x with
   both rest frames is what makes spelling feel slow and choppy, so
   letters get a speed boost and a small trim at each end.
   ──────────────────────────────────────────────────────────────── */
const SPEED = {
  word: 1.0,
  letter: 1.60, // fingerspelling plays faster
  number: 1.35,
};

const TRIM = {
  // seconds shaved off the start/end of each clip
  word: { start: 0.0, end: 0.04 },
  letter: { start: 0.1, end: 0.18 },
  number: { start: 0.06, end: 0.12 },
};

// Crossfade between clips (ms). 0 = hard cut.
const FADE_MS = 10;

const ISLVideoPlayer = ({ islTranslation, liveTranscription, autoPlay = false }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processedWords, setProcessedWords] = useState([]);
  const [videoNotFound, setVideoNotFound] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [customFileName, setCustomFileName] = useState("");
  const [activeBuffer, setActiveBuffer] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  // Two stacked <video> elements. One plays while the other preloads.
  const bufA = useRef(null);
  const bufB = useRef(null);
  const buffers = [bufA, bufB];

  // Which clip index each buffer currently holds
  const bufferIndex = useRef([-1, -1]);

  // Mirrors of state that async callbacks need to read fresh
  const activeRef = useRef(0);
  const indexRef = useRef(0);
  const playingRef = useRef(false);
  const wordsRef = useRef([]);
  const advancingRef = useRef(false);
  const advanceRef = useRef(() => {});
  const prevGlossRef = useRef("");

  // Cache: url -> objectURL, so repeated letters never refetch
  const clipCache = useRef(new Map());
  const missing = useRef(new Set());

  useEffect(() => { activeRef.current = activeBuffer; }, [activeBuffer]);
  useEffect(() => { indexRef.current = currentWordIndex; }, [currentWordIndex]);
  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { wordsRef.current = processedWords; }, [processedWords]);

  const kindOf = (item) => (item && item.type) || "word";

  /* Fetch a clip once and hand back a local object URL. */
  const resolveSrc = useCallback(async (item) => {
    const url = getVideoSource(item);
    if (missing.current.has(url)) return null;
    if (clipCache.current.has(url)) return clipCache.current.get(url);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const objUrl = URL.createObjectURL(await res.blob());
      clipCache.current.set(url, objUrl);
      return objUrl;
    } catch {
      missing.current.add(url);
      return null;
    }
  }, []);

  /* Load clip `idx` into buffer `buf`; resolves once its first frame is decoded. */
  const loadBuffer = useCallback(
    async (buf, idx) => {
      const el = buffers[buf].current;
      const item = wordsRef.current[idx];
      if (!el || !item) return false;
      if (bufferIndex.current[buf] === idx && el.readyState >= 2) return true;

      const src = await resolveSrc(item);
      if (!src) {
        bufferIndex.current[buf] = idx;
        return false;
      }

      return new Promise((resolve) => {
        const finish = (ok) => {
          el.removeEventListener("loadeddata", onOk);
          el.removeEventListener("error", onErr);
          resolve(ok);
        };
        const onOk = () => {
          const t = TRIM[kindOf(item)] || TRIM.word;
          try {
            if (t.start > 0 && el.duration > t.start * 2) el.currentTime = t.start;
          } catch (e) { /* seek not ready yet — harmless */ }
          bufferIndex.current[buf] = idx;
          finish(true);
        };
        const onErr = () => {
          bufferIndex.current[buf] = idx;
          finish(false);
        };
        el.addEventListener("loadeddata", onOk, { once: true });
        el.addEventListener("error", onErr, { once: true });
        el.src = src;
        el.load();
      });
    },
    [resolveSrc]
  );

  /* Warm the inactive buffer with the following clip. */
  const preloadNext = useCallback(
    (idx) => {
      const next = idx + 1;
      if (next >= wordsRef.current.length) return;
      const other = activeRef.current === 0 ? 1 : 0;
      loadBuffer(other, next);
    },
    [loadBuffer]
  );

  const stopPlaying = useCallback(() => {
    setIsPlaying(false);
    playingRef.current = false;
    buffers.forEach((b) => b.current && b.current.pause());
  }, []);

  /* Play clip `idx` on the active buffer, then warm the next one. */
  const playIndex = useCallback(
    async (idx) => {
      const words = wordsRef.current;
      if (idx >= words.length) {
        stopPlaying();
        return;
      }

      const item = words[idx];
      const buf = activeRef.current;
      const el = buffers[buf].current;
      if (!el) return;

      const ready = bufferIndex.current[buf] === idx && el.readyState >= 2;

      if (!ready) {
        setIsBuffering(true);
        const ok = await loadBuffer(buf, idx);
        setIsBuffering(false);
        if (!ok) {
          // No clip for this item — flag it briefly and move on.
          setVideoNotFound(true);
          setTimeout(() => {
            setVideoNotFound(false);
            if (playingRef.current) advanceRef.current();
          }, 700);
          return;
        }
      }

      el.playbackRate = SPEED[kindOf(item)] || 1;
      advancingRef.current = false;
      setHasStarted(true);

      try {
        await el.play();
      } catch (err) {
        console.error("Error playing clip:", err);
      }

      preloadNext(idx);
    },
    [loadBuffer, preloadNext, stopPlaying]
  );

  /* Move to the next clip by flipping to the already-warm buffer. */
  const advance = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;

    const next = indexRef.current + 1;
    indexRef.current = next;
    setCurrentWordIndex(next);

    if (next >= wordsRef.current.length) {
      stopPlaying();
      advancingRef.current = false;
      return;
    }

    const other = activeRef.current === 0 ? 1 : 0;
    activeRef.current = other;
    setActiveBuffer(other);
    playIndex(next);
  }, [playIndex, stopPlaying]);

  useEffect(() => { advanceRef.current = advance; }, [advance]);

  /* End a clip early so we skip trailing rest frames. */
  const handleTimeUpdate = (buf) => {
    if (buf !== activeRef.current || !playingRef.current) return;
    const el = buffers[buf].current;
    const item = wordsRef.current[indexRef.current];
    if (!el || !item || !isFinite(el.duration)) return;

    const t = TRIM[kindOf(item)] || TRIM.word;
    if (t.end > 0 && el.currentTime >= el.duration - t.end) advance();
  };

  const handleEnded = (buf) => {
    if (buf !== activeRef.current || !playingRef.current) return;
    advance();
  };

  const startPlaying = () => {
    if (processedWords.length === 0) return;
    const from = indexRef.current >= processedWords.length ? 0 : indexRef.current;
    indexRef.current = from;
    setCurrentWordIndex(from);
    setIsPlaying(true);
    playingRef.current = true;
    playIndex(from);
  };

  const resetPlayback = () => {
    stopPlaying();
    setCurrentWordIndex(0);
    indexRef.current = 0;
    setVideoNotFound(false);
    setHasStarted(false);
    bufferIndex.current = [-1, -1];
    buffers.forEach((b) => {
      if (b.current) {
        b.current.pause();
        b.current.currentTime = 0;
      }
    });
    setActiveBuffer(0);
    activeRef.current = 0;
  };

  const handleDownloadClick = () => {
    const defaultName = createDefaultFilename(processedWords);
    setCustomFileName(defaultName);
    setShowDownloadModal(true);
  };

  const handleDownloadConfirm = () => {
    const filename = customFileName.trim() || createDefaultFilename(processedWords);
    downloadCombinedVideo(
      processedWords,
      liveTranscription,
      filename,
      setIsDownloading,
      setShowDownloadModal
    );
  };

  /* Gloss changed.
     - Append (real-time mode): extend the queue, keep signing, never restart.
     - New sentence: full reset. */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const gloss = (islTranslation || "").trim();
      const prev = prevGlossRef.current;
      const isAppend =
        prev !== "" && gloss.startsWith(prev) && gloss.length > prev.length;

      if (isAppend) {
        const tail = gloss.slice(prev.length).trim();
        if (!tail) return;

        const added = await processISLTranslation(tail);
        if (cancelled || added.length === 0) return;

        const existing = wordsRef.current;
        const offset = existing.length
          ? Math.max(...existing.map((it) => it.wordIndex || 0)) + 1
          : 0;
        const shifted = added.map((it) => ({
          ...it,
          wordIndex: (it.wordIndex || 0) + offset,
        }));
        const merged = existing.concat(shifted);
        wordsRef.current = merged;
        setProcessedWords(merged);

        prevGlossRef.current = gloss;

        // Playback may have caught up and stopped — resume on the new material.
        if (autoPlay && !playingRef.current) {
          setIsPlaying(true);
          playingRef.current = true;
          playIndex(indexRef.current);
        } else if (!playingRef.current) {
          // idle: at least warm the next clip
          loadBuffer(activeRef.current, indexRef.current);
        }
        return;
      }

      // Fresh sentence -> full reset
      const processed = await processISLTranslation(gloss);
      if (cancelled) return;

      setProcessedWords(processed);
      wordsRef.current = processed;
      setCurrentWordIndex(0);
      indexRef.current = 0;
      setIsPlaying(false);
      playingRef.current = false;
      setVideoNotFound(false);
      setHasStarted(false);
      setActiveBuffer(0);
      activeRef.current = 0;
      bufferIndex.current = [-1, -1];
      prevGlossRef.current = gloss;

      if (processed.length > 0) {
        await loadBuffer(0, 0);
        if (cancelled) return;
        if (processed.length > 1) loadBuffer(1, 1);
        if (autoPlay) {
          setIsPlaying(true);
          playingRef.current = true;
          playIndex(0);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [islTranslation, loadBuffer, playIndex, autoPlay]);

  /* Release cached object URLs on unmount. */
  useEffect(() => {
    const cache = clipCache.current;
    return () => {
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  const hasWords = processedWords.length > 0;
  const progress = hasWords
    ? (Math.min(currentWordIndex, processedWords.length) / processedWords.length) * 100
    : 0;
  const currentItem = hasWords ? processedWords[currentWordIndex] : null;
  const currentLabel = (currentItem && (currentItem.display || currentItem.text)) || null;
  const spellingNow = currentItem && currentItem.type === "letter";

  const btnBase =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold transition active:scale-[.99] disabled:cursor-not-allowed";

  return (
    <div className="flex h-full w-full flex-col">
      {/* ── Video stage ─────────────────────────────────────────── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-stage-line bg-stage sm:aspect-[16/9]">
        {/* Two buffers: the inactive one preloads the next clip */}
        {[0, 1].map((i) => (
          <video
            key={i}
            ref={buffers[i]}
            className="absolute inset-0 h-full w-full object-contain"
            style={{
              opacity: hasStarted && activeBuffer === i ? 1 : 0,
              transition: `opacity ${FADE_MS}ms linear`,
            }}
            onEnded={() => handleEnded(i)}
            onTimeUpdate={() => handleTimeUpdate(i)}
            muted
            playsInline
            preload="auto"
          />
        ))}

        {/* Idle state */}
        {!hasStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <svg className="h-12 w-12 text-stage-ink opacity-80" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.4"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V10" />
              <path d="M10 10V5a1.5 1.5 0 0 1 3 0v5" />
              <path d="M13 10.5V6a1.5 1.5 0 0 1 3 0v6" />
              <path d="M16 9.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.9-2.5L4 14.2a1.6 1.6 0 0 1 2.6-1.9L8 14" />
            </svg>
            <p className="text-[13px] text-white/45">
              {hasWords
                ? "Press play to sign the translation"
                : "Speak to generate a sign sequence"}
            </p>
          </div>
        )}

        {/* Now-signing caption */}
        {hasStarted && currentLabel && !videoNotFound && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2.5 rounded-full border border-white/10 bg-black/45 py-1.5 pl-2.5 pr-3 backdrop-blur-sm">
            <span className="text-[10px] uppercase tracking-[.1em] text-white/55">
              {spellingNow ? "Spelling" : "Signing"}
            </span>
            <span className="font-mono text-[12.5px] font-semibold tracking-wide text-white">
              {currentLabel}
            </span>
          </div>
        )}

        {/* Counter */}
        {hasWords && (
          <div className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 font-mono text-[11px] text-white/60 backdrop-blur-sm">
            {Math.min(currentWordIndex + (isPlaying ? 1 : 0), processedWords.length)}
            {" / "}
            {processedWords.length}
          </div>
        )}

        {/* Missing clip */}
        {videoNotFound && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stage/85 px-6 text-center backdrop-blur-sm">
            <svg className="h-7 w-7 text-live-ink" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
            <p className="text-[13px] font-medium text-white/80">No clip for this sign</p>
            <p className="text-[12px] text-white/45">Skipping to the next one…</p>
          </div>
        )}

        {/* Buffering (only appears if a clip wasn't warm in time) */}
        {isBuffering && !videoNotFound && (
          <div className="absolute inset-0 flex items-center justify-center gap-2.5 bg-stage/60 backdrop-blur-sm">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
            <span className="text-[13px] text-white/70">Buffering…</span>
          </div>
        )}

        {/* Progress rail */}
        {hasWords && (
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
            <div className="h-full bg-accent transition-all duration-200"
              style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* ── Controls ────────────────────────────────────────────── */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <button
          onClick={isPlaying ? stopPlaying : startPlaying}
          disabled={!hasWords}
          className={`${btnBase} flex-1 sm:flex-none sm:px-5 ${
            !hasWords
              ? "bg-surface-2 text-muted"
              : isPlaying
              ? "bg-live text-on-live hover:brightness-105"
              : "bg-accent text-on-accent hover:brightness-105"
          }`}
        >
          {isPlaying ? <Pause size={17} /> : <Play size={17} />}
          <span className="whitespace-nowrap">{isPlaying ? "Stop" : "Play"}</span>
        </button>

        <button
          onClick={resetPlayback}
          disabled={!hasWords}
          className={`${btnBase} border border-line bg-surface-2 text-ink hover:border-muted disabled:text-muted disabled:hover:border-line`}
        >
          <RotateCcw size={16} />
          <span className="whitespace-nowrap">Reset</span>
        </button>

        <button
          onClick={handleDownloadClick}
          disabled={!hasWords || isDownloading}
          className={`${btnBase} border border-line bg-surface-2 text-ink hover:border-muted disabled:text-muted disabled:hover:border-line`}
        >
          <Download size={16} />
          <span className="whitespace-nowrap">
            {isDownloading ? "Creating…" : "Download"}
          </span>
        </button>
      </div>

      {/* ── Sign sequence ───────────────────────────────────────── */}
      <div className="mt-4 min-h-0 flex-1">
        <div className="mb-2.5 flex items-baseline justify-between gap-3">
          <span className="text-[10.5px] font-semibold uppercase tracking-[.14em] text-muted">
            Sign sequence
          </span>
          {hasWords && (
            <span className="font-mono text-[11px] text-muted">
              {processedWords.length} clips
            </span>
          )}
        </div>

        {hasWords ? (
          <div className="max-h-28 overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-1.5">
              {processedWords.map((item, index) => {
                const isCurrent = index === currentWordIndex && isPlaying;
                const isDone = index < currentWordIndex && isPlaying;
                return (
                  <React.Fragment key={index}>
                    <span
                      className={`rounded-lg border px-2.5 py-1 font-mono text-[12px] font-semibold tracking-wide transition-colors ${
                        isCurrent
                          ? "border-accent bg-accent-soft text-accent-ink"
                          : isDone
                          ? "border-line bg-surface-2 text-muted line-through decoration-1"
                          : "border-line bg-surface-2 text-ink"
                      }`}
                    >
                      {item.display || item.text}
                    </span>

                    {index < processedWords.length - 1 &&
                      item.wordIndex !== processedWords[index + 1].wordIndex && (
                        <span className="self-center px-0.5 text-muted opacity-40">|</span>
                      )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-[13px] leading-relaxed text-muted">
            The clips that make up each sign will be listed here.
          </p>
        )}
      </div>

      <DownloadModal
        showDownloadModal={showDownloadModal}
        setShowDownloadModal={setShowDownloadModal}
        customFileName={customFileName}
        setCustomFileName={setCustomFileName}
        handleDownloadConfirm={handleDownloadConfirm}
        isDownloading={isDownloading}
      />
    </div>
  );
};

export default ISLVideoPlayer;
