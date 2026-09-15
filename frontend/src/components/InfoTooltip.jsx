const InfoTooltip = ({ content }) => {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={content}
        className="grid h-6 w-6 place-items-center rounded-full border border-line bg-surface-2 text-muted transition hover:text-ink"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </button>

      <span className="pointer-events-none absolute right-0 top-8 z-30 w-max max-w-[210px] rounded-lg border border-line bg-ink px-2.5 py-1.5 text-[11px] font-medium leading-snug text-canvas opacity-0 shadow-soft transition-opacity duration-150 group-hover:opacity-100">
        {content}
      </span>
    </span>
  );
};

export default InfoTooltip;
