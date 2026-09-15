import Transcript from "./Transcript";
import InfoTooltip from "./InfoTooltip";

const LiveTranscriptSection = ({ transcript, isProcessing, processingStatus }) => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
      {/* Progress shimmer — only while transcribing */}
      <div className="h-[2px] overflow-hidden bg-transparent">
        {isProcessing && <div className="shimmer-bar" />}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-[10.5px] font-semibold uppercase tracking-[.14em] text-muted">
            Heard
          </span>
          <h3 className="font-display text-[15.5px] font-semibold tracking-[-.01em] text-ink">
            Transcript
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-6 items-center gap-2 rounded-full px-2.5 text-[11px] font-semibold ${
              isProcessing
                ? "bg-accent-soft text-accent-ink"
                : "bg-surface-2 text-muted"
            }`}
          >
            <span
              className={`h-[7px] w-[7px] rounded-full ${
                isProcessing ? "animate-pulse bg-accent-ink" : "bg-muted"
              }`}
            />
            {isProcessing ? processingStatus || "Transcribing" : "Listening"}
          </span>
          <InfoTooltip content="Real-time speech to text" />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-5">
        <Transcript transcript={transcript} />

        {isProcessing && (
          <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent-ink [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent-ink [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent-ink [animation-delay:300ms]" />
            </span>
            <span className="text-xs font-medium text-accent-ink">
              {processingStatus || "Translating your speech to ISL…"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTranscriptSection;
