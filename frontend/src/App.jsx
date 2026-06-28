import { useState, useEffect } from "react";

import { useSpeechRecognition } from "./hooks/useSpeechRecognition.js";

import { ThemeProvider } from "./contexts/ThemeContext.jsx";

import Header from "./components/Header.jsx";

import BackgroundElements from "./components/BackgroundElements.jsx";

import LiveTranscriptSection from "./components/LiveTranscriptSection.jsx";

import ISLGlossSection from "./components/ISLGlossSection.jsx";

import ISLVideoSection from "./components/ISLVideoSection.jsx";

import Footer from "./components/Footer.jsx";

function FirstRunAlert({ isVisible, onClose }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/20 dark:border-slate-700/30 transform transition-all">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-blue-500/20 rounded-2xl">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h3 className="ml-4 text-xl font-bold text-slate-900 dark:text-white">
            Welcome to SoundSigns
          </h3>
        </div>

        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
          The first translation may take a moment as our AI server wakes up.
          Subsequent translations will be near-instant.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 active:scale-95"
        >
          Got it!
        </button>
      </div>
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
  } = useSpeechRecognition();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 dark:from-black dark:via-slate-950 dark:to-black font-inter transition-colors duration-500 flex flex-col relative overflow-hidden">
      <BackgroundElements />

      <FirstRunAlert
        isVisible={showFirstRunAlert}
        onClose={() => setShowFirstRunAlert(false)}
      />

      <div className="z-10 flex-shrink-0 px-4 py-4">
        <Header
          isRecording={isRecording}
          toggleRecording={toggleRecording}
          isProcessing={isProcessing}
          processingStatus={processingStatus}
        />
      </div>

      <main className="z-10 flex-1 container mx-auto px-4 pb-32 flex flex-col min-h-0">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
          <div className="h-full">
            <ISLVideoSection isl={isl} transcript={transcript} />
          </div>

          <div className="flex flex-col gap-8 h-full">
            <LiveTranscriptSection
              transcript={transcript}
              isProcessing={isProcessing}
              processingStatus={processingStatus}
            />

            <ISLGlossSection isl={isl} />
          </div>
        </div>
      </main>

      <div className="z-10 flex-shrink-0 px-4 py-4">
        <Footer />
      </div>
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