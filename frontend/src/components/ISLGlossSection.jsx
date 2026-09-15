import InfoTooltip from "./InfoTooltip";

const Arrow = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const ISLGlossSection = ({ isl }) => {
  const tokens = isl ? isl.trim().split(/\s+/).filter(Boolean) : [];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-[10.5px] font-semibold uppercase tracking-[.14em] text-muted">
            Structure
          </span>
          <h3 className="font-display text-[15.5px] font-semibold tracking-[-.01em] text-ink">
            ISL gloss
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 items-center rounded-full bg-surface-2 px-2.5 text-[11px] font-semibold text-muted">
            {tokens.length ? `${tokens.length} signs` : "SOV order"}
          </span>
          <InfoTooltip content="The structural notation of sign language" />
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {tokens.length === 0 ? (
          <p className="text-[15px] leading-relaxed text-muted">
            <span className="font-semibold text-ink">
              Speak, and the signed order appears here.
            </span>{" "}
            ISL reorders English — time and topic come first.
          </p>
        ) : (
          <>
            <p className="mb-3 text-[11.5px] leading-relaxed text-muted">
              In the sequence it's signed:
            </p>
            <div className="flex flex-wrap items-stretch gap-2">
              {tokens.map((word, i) => (
                <div key={`${word}-${i}`} className="flex items-stretch gap-2">
                  <div className="token-pop flex min-w-[58px] flex-col gap-[3px] rounded-xl border border-line bg-surface-2 px-3 pb-2 pt-2.5">
                    <span className="font-mono text-[9.5px] tracking-wider text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[14.5px] font-semibold tracking-wide text-ink">
                      {word}
                    </span>
                  </div>
                  {i < tokens.length - 1 && (
                    <span className="flex items-center text-muted opacity-50">
                      <Arrow />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ISLGlossSection;
