import { useState, useEffect } from "react";

// Real-time: translates each phrase as you pause, no Stop needed.
import { useRealtimeTranslation } from "./hooks/useRealtimeTranslation.js";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

import Header from "./components/Header.jsx";
import Microphone from "./components/Microphone.jsx";
import BackgroundElements from "./components/BackgroundElements.jsx";
import LiveTranscriptSection from "./components/LiveTranscriptSection.jsx";
import ISLGlossSection from "./components/ISLGlossSection.jsx";
import ISLVideoSection from "./components/ISLVideoSection.jsx";
import Footer from "./components/Footer.jsx";

function FirstRunAlert({ isVisible, onClose }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-7 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent-ink">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-display text-lg font-semibold text-ink">Welcome to SoundSigns</h3>
        </div>

        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Start the mic and just talk — signing begins on its own after each
          phrase. The very first translation may take a moment while the server
          wakes up.
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-on-accent transition hover:brightness-105 active:scale-[.99]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function MobileMicDock({ isRecording, toggleRecording, isProcessing, processingStatus }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_26px_-18px_rgba(0,0,0,.35)] sm:hidden">
      <Microphone
        full
        isRecording={isRecording}
        toggleRecording={toggleRecording}
        isProcessing={isProcessing}
      />
      {isProcessing && processingStatus && (
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" />
          <span className="text-[11px] font-medium text-accent-ink">{processingStatus}</span>
        </div>
      )}
    </div>
  );
}

function AppContent() {
  const {
    transcript,
    isl,
    isRecording,
    isProcessing,
    processingStatus,
    toggleRecording,
    error,
  } = useRealtimeTranslation();

  const [showFirstRunAlert, setShowFirstRunAlert] = useState(false);

  useEffect(() => {
    const hasVisitedBefore = JSON.parse(
      sessionStorage.getItem("soundsigns_visited") || "false"
    );
    if (!hasVisitedBefore) {
      setShowFirstRunAlert(true);
      sessionStorage.setItem("soundsigns_visited", "true");
    }
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-canvas text-ink transition-colors duration-300">
      <BackgroundElements />

      <FirstRunAlert
        isVisible={showFirstRunAlert}
        onClose={() => setShowFirstRunAlert(false)}
      />

      <div className="relative z-10 px-4 pt-4 sm:pt-5">
        <Header
          isRecording={isRecording}
          toggleRecording={toggleRecording}
          isProcessing={isProcessing}
          processingStatus={processingStatus}
          isl={isl}
        />
      </div>

      {error && (
        <div className="relative z-10 mx-auto mt-3 w-full max-w-6xl px-4">
          <p className="rounded-xl border border-line bg-live-soft px-4 py-2.5 text-[13px] font-medium text-live-ink">
            {error}
          </p>
        </div>
      )}

      <main className="relative z-10 container mx-auto flex-1 px-4 pb-8 pt-5 sm:pb-16 sm:pt-6">
        <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-[1.35fr_1fr]">
          {/* autoPlay: sign continuously as phrases arrive */}
          <ISLVideoSection isl={isl} transcript={transcript} autoPlay />

          <div className="flex flex-col gap-5 sm:gap-6">
            <LiveTranscriptSection
              transcript={transcript}
              isProcessing={isProcessing}
              processingStatus={processingStatus}
            />
            <ISLGlossSection isl={isl} />
          </div>
        </div>
      </main>

      <div className="relative z-10 px-4 pb-28 sm:pb-6">
        <Footer />
      </div>

      <MobileMicDock
        isRecording={isRecording}
        toggleRecording={toggleRecording}
        isProcessing={isProcessing}
        processingStatus={processingStatus}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
