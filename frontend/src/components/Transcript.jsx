const Transcript = ({ transcript }) => {
  if (!transcript) {
    return (
      <p className="text-[15px] leading-relaxed text-muted">
        <span className="font-semibold text-ink">Nothing yet.</span> Start
        listening and your words appear here as you speak.
      </p>
    );
  }

  return (
    <p className="text-[19px] font-[450] leading-relaxed tracking-[-.005em] text-ink">
      {transcript}
    </p>
  );
};

export default Transcript;
