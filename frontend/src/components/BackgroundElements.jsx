// Quiet ambient layer. The old galaxy gradient is gone — this is just a
// barely-there wash at the top so the canvas doesn't feel flat.
const BackgroundElements = () => {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-x-0 top-0 h-72 opacity-50"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, var(--accent-soft), transparent 70%)",
        }}
      />
    </div>
  );
};

export default BackgroundElements;
