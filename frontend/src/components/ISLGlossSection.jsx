import InfoTooltip from "./InfoTooltip";

const ISLGlossSection = ({ isl }) => {
  return (
    <div className="group relative bg-white/10 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] border border-white/30 dark:border-slate-700/50 shadow-2xl p-1 transition-all duration-500 hover:scale-[1.01] overflow-hidden">
      {/* Neon Accent Glow - Top edge */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500 blur-md opacity-40 animate-pulse" />
              <div className="relative p-3 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl text-white shadow-lg shadow-violet-500/40">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-8 14v2a1 1 0 001 1h8a1 1 0 001-1v-2M5 8h14l-1 8H6L5 8z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black bg-gradient-to-r from-violet-600 to-purple-500 dark:from-violet-300 dark:to-purple-300 bg-clip-text text-transparent uppercase tracking-tight">
                ISL Gloss
              </h3>
              <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">Structural Notation</span>
            </div>
          </div>
          <InfoTooltip content="The structural notation of sign language" />
        </div>

        <div className="flex-1 bg-violet-500/10 dark:bg-violet-900/20 rounded-3xl p-5 border border-violet-500/30 shadow-inner overflow-auto relative group-hover:border-violet-500/50 transition-colors">
          {/* Decorative grid pattern for "tech" feel */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          <p className="relative z-10 font-mono text-base text-violet-800 dark:text-violet-300 font-bold leading-relaxed whitespace-pre-wrap drop-shadow-sm">
            {isl || (
              <span className="text-slate-400 italic font-sans font-medium animate-pulse">
                Waiting for AI translation...
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ISLGlossSection;