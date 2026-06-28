import ThemeToggle from "./ThemeToggle";
import Microphone from "./Microphone";

const Header = ({
  isRecording,
  toggleRecording,
  isProcessing,
  processingStatus,
  isl,
}) => {
  return (
    <header className="max-w-6xl mx-auto">
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/40 dark:border-slate-800/40 shadow-xl rounded-3xl px-6 py-3 flex items-center justify-between transition-all duration-300 ring-1 ring-black/5 dark:ring-white/5">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-xl">S</span>
          </div>

          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              SoundSigns
            </h1>

            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              Voice to Sign Bridge
            </p>
          </div>
        </div>

        {/* Right side — mic always visible + status shown underneath */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            {/* Mic button — always shown, never hidden */}
            <Microphone
              isRecording={isRecording}
              toggleRecording={toggleRecording}
              isProcessing={isProcessing}
            />

            {/* Processing status line — appears below mic when translating */}
            {isProcessing && processingStatus && (
              <div className="flex items-center gap-1.5 pr-1">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />

                <span className="text-[11px] font-medium text-blue-500 dark:text-blue-400 animate-pulse">
                  {processingStatus}
                </span>
              </div>
            )}

            {/* Done status */}
            {!isProcessing && processingStatus === "" && isl && (
              <span className="text-[11px] text-emerald-500 font-semibold pr-1">
                ✓ Translation ready
              </span>
            )}
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;