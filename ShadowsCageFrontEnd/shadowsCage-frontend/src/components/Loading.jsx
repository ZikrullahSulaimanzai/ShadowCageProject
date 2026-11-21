
function Loading() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading-indicator">
        <span />
        <span />
        <span />
      </div>

      <p>ACCESSING ARCHIVE...</p>

      <span className="loading-subtext">
        ESTABLISHING SECURE CONNECTION
      </span>
    </div>
  );
}

export default Loading;