import "./feedback.css";

function ErrorMessage({ message }) {
  return (
    <div className="error-message" role="alert">
      <span className="feedback-label">
        SYSTEM ALERT // ERROR
      </span>

      <h2>OPERATION FAILED</h2>

      <p>{message}</p>

      <span className="feedback-code">
        ERROR_STATUS: REQUEST_UNSUCCESSFUL
      </span>
    </div>
  );
}

export default ErrorMessage;