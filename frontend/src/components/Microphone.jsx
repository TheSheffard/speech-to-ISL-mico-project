const MicIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0M12 19v3" />
  </svg>
);

const Microphone = ({ isRecording, toggleRecording, isProcessing, full = false }) => {
  const size = full
    ? "h-12 w-full justify-center text-[15px]"
    : "h-10 text-[13.5px]";

  return (
    <button
      onClick={toggleRecording}
      aria-pressed={isRecording}
      className={`inline-flex items-center gap-2.5 rounded-full px-4 pr-5 font-semibold transition active:scale-[.99] ${size} ${
        isRecording
          ? "bg-live text-on-live hover:brightness-105"
          : "bg-accent text-on-accent hover:brightness-105"
      }`}
    >
      {isRecording ? (
        <>
          <span className="flex items-center gap-[3px]">
            <i className="eq-bar" />
            <i className="eq-bar [animation-delay:150ms]" />
            <i className="eq-bar [animation-delay:300ms]" />
            <i className="eq-bar [animation-delay:450ms]" />
          </span>
          Stop
        </>
      ) : (
        <>
          <MicIcon size={full ? 19 : 16} />
          {isProcessing ? "Working…" : "Start listening"}
        </>
      )}
    </button>
  );
};

export default Microphone;
