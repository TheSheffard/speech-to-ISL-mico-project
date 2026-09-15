import ISLVideoPlayer from "./ISLVideoPlayer";
import WordDatabaseBrowser from "./WordDatabaseBrowser";
import InfoTooltip from "./InfoTooltip";

const ISLVideoSection = ({ isl, transcript, autoPlay = false }) => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-[10.5px] font-semibold uppercase tracking-[.14em] text-muted">
            Output
          </span>
          <h2 className="font-display text-[15.5px] font-semibold tracking-[-.01em] text-ink">
            Signing
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <WordDatabaseBrowser />
          <InfoTooltip content="Visual ISL translation of your speech" />
        </div>
      </div>

      {/* The player owns its own dark stage */}
      <div className="flex min-h-0 flex-1 flex-col p-3.5">
        <ISLVideoPlayer
          islTranslation={isl}
          liveTranscription={transcript}
          autoPlay={autoPlay}
        />
      </div>
    </div>
  );
};

export default ISLVideoSection;
