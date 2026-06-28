import ISLVideoPlayer from "./ISLVideoPlayer";
import WordDatabaseBrowser from "./WordDatabaseBrowser";
import InfoTooltip from "./InfoTooltip";

const ISLVideoSection = ({ isl, transcript }) => {
  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg rounded-3xl border border-white/60 dark:border-slate-800/60 shadow-xl p-4 ring-1 ring-white/20 dark:ring-slate-700/20 h-full flex flex-col transition-all duration-300">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-600 dark:text-cyan-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Sign Language Player</h2>
        </div>
        <div className="flex items-center gap-2">
          <WordDatabaseBrowser />
          <InfoTooltip content="Visual ISL translation" />
        </div>
      </div>
      
      <div className="flex-1 bg-slate-950 rounded-2xl overflow-hidden shadow-inner relative group ring-4 ring-black/10 dark:ring-white/5">
        <ISLVideoPlayer islTranslation={isl} liveTranscription={transcript} />
      </div>
    </div>
  );
};

export default ISLVideoSection;