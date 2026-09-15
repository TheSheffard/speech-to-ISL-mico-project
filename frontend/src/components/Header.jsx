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
    <header className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-3 py-2.5 shadow-soft sm:px-4 sm:py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-ink font-display text-lg font-bold text-canvas">
            S
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold leading-none tracking-[-.01em] text-ink">
              voice to sign Language
            </h1>
            <p className="mt-1 hidden text-[11px] tracking-wide text-muted sm:block">
              Voice to Sign Language, live
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Mic lives in the header on tablet/desktop; on phones it's docked at the bottom */}
          <div className="hidden flex-col items-end gap-1 sm:flex">
            <Microphone
              isRecording={isRecording}
              toggleRecording={toggleRecording}
              isProcessing={isProcessing}
            />

            {isProcessing && processingStatus && (
              <div className="flex items-center gap-1.5 pr-1">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" />
                <span className="text-[11px] font-medium text-accent-ink">
                  {processingStatus}
                </span>
              </div>
            )}

            {!isProcessing && processingStatus === "" && isl && (
              <span className="pr-1 text-[11px] font-medium text-muted">
                Translation ready
              </span>
            )}
          </div>

          <div className="hidden h-6 w-px bg-line sm:block" />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
