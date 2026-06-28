export default function Microphone({ isRecording, toggleRecording, isProcessing }) {
  // Disable mic button while AI is translating so user knows to wait
  const isDisabled = isProcessing && !isRecording;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleRecording}
        disabled={isDisabled}
        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 shadow-[0_0_25px_rgba(239,68,68,0.7)] text-white"
            : isProcessing
            ? "bg-slate-600 text-slate-300 cursor-not-allowed"
            : "bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white"
        }`}
      >
        {/* Pulse ring when recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30 pointer-events-none" />
        )}

        {isRecording ? (
          <>
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
            <span className="relative z-10">Stop</span>
            <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
          </>
        ) : isProcessing ? (
          <>
            {/* Spinner inside button when processing */}
            <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
            <span>Translating...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>Speak</span>
          </>
        )}
      </button>

      {/* Label underneath */}
      <div className="flex flex-col">
        <span className={`text-xs font-bold transition-colors ${
          isRecording
            ? "text-red-400 animate-pulse"
            : isProcessing
            ? "text-blue-400"
            : "text-slate-500 dark:text-slate-400"
        }`}>
          {isRecording
            ? "● Recording..."
            : isProcessing
            ? "⏳ Please wait..."
            : "Tap to Speak"}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
          {isRecording
            ? "Tap STOP to finish"
            : isProcessing
            ? "AI translating"
            : "Real-time Audio"}
        </span>
      </div>
    </div>
  );
}