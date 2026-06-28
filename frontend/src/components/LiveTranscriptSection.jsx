import Transcript from "./Transcript";
import InfoTooltip from "./InfoTooltip";

const LiveTranscriptSection = ({ transcript, isProcessing, processingStatus }) => {
  return (
    <div className="group relative bg-white/10 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] border border-white/30 dark:border-slate-700/50 shadow-2xl p-1 transition-all duration-500 hover:scale-[1.01] overflow-hidden">

      {/* Top accent glow — turns blue when translating */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-500 ${
        isProcessing
          ? "from-transparent via-blue-400 to-transparent opacity-100"
          : "from-transparent via-emerald-400 to-transparent opacity-70 group-hover:opacity-100"
      }`} />

      <div className="p-6 flex flex-col h-full">

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`absolute inset-0 blur-md opacity-40 rounded-2xl transition-colors duration-500 ${
                isProcessing ? "bg-blue-500 animate-pulse" : "bg-emerald-500 animate-pulse"
              }`} />
              <div className={`relative p-3 rounded-2xl text-white shadow-lg transition-colors duration-500 ${
                isProcessing
                  ? "bg-gradient-to-br from-blue-400 to-indigo-600 shadow-blue-500/40"
                  : "bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/40"
              }`}>
                {isProcessing ? (
                  /* Spinner icon when translating */
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  /* Document icon when idle/listening */
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
            </div>

            <div>
              <h3 className={`text-xl font-black uppercase tracking-tight bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 ${
                isProcessing
                  ? "from-blue-400 to-indigo-400"
                  : "from-emerald-600 to-teal-500 dark:from-emerald-300 dark:to-teal-300"
              }`}>
                {isProcessing ? "Translating..." : "Live Transcript"}
              </h3>

              {/* Status pill */}
              <div className="flex items-center gap-2 mt-0.5">
                {isProcessing ? (
                  <>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                      {processingStatus || "Processing..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      Listening Now
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <InfoTooltip content="Real-time speech conversion" />
        </div>

        {/* Transcript box */}
        <div className={`flex-1 rounded-3xl p-5 border shadow-inner overflow-auto backdrop-blur-md ring-1 transition-all duration-500 ${
          isProcessing
            ? "bg-blue-500/5 border-blue-500/20 ring-blue-500/10"
            : "bg-white/20 dark:bg-black/40 border-white/20 dark:border-slate-800/50 ring-black/5"
        }`}>
          <Transcript transcript={transcript} />

          {/* Translating overlay at bottom of box */}
          {isProcessing && (
            <div className="mt-3 flex items-center gap-2 pt-3 border-t border-blue-500/20">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-blue-400 font-medium">
                {processingStatus || "Translating your speech to ISL..."}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTranscriptSection;