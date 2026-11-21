import "./report-button.css";
import { useState } from "react";
import { Flag, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function ReportButton({ targetType, targetId }) {
  const { isAuthenticated, loading } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    const payload = {
      [targetType]: targetId,
      reason,
      description: description.trim(),
    };

    try {
      await api.post("reports/", payload);

      setSubmitted(true);
      setDescription("");
    } catch (err) {
      console.error("Report submission failed:", err);

      const data = err.response?.data;

      const message =
        typeof data === "string"
          ? data
          : data?.detail ||
            data?.post?.[0] ||
            data?.comment?.[0] ||
            data?.reason?.[0] ||
            "Could not submit your report. Please try again.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  if (!isAuthenticated) return null;

  return (
    <div className="report-wrapper">
      {!isOpen && !submitted && (
        <button
          type="button"
          className="report-trigger"
          onClick={() => setIsOpen(true)}
        >
          <Flag size={15} />
          REPORT
        </button>
      )}

      {submitted && (
        <p className="report-success">
          Report submitted successfully.
        </p>
      )}

      {isOpen && !submitted && (
        <form className="report-form" onSubmit={handleSubmit}>
          <div className="report-form-header">
            <strong>REPORT CONTENT</strong>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError("");
              }}
              aria-label="Close report form"
            >
              <X size={17} />
            </button>
          </div>

          <label htmlFor={`report-reason-${targetType}-${targetId}`}>
            Reason
          </label>

          <select
            id={`report-reason-${targetType}-${targetId}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          >
            <option value="spam">Spam</option>
            <option value="harassment">Harassment or Bullying</option>
            <option value="hate_speech">Hate Speech</option>
            <option value="inappropriate">Inappropriate Content</option>
            <option value="misinformation">
              False or Misleading Information
            </option>
            <option value="other">Other</option>
          </select>

          <label htmlFor={`report-description-${targetType}-${targetId}`}>
            Additional details (optional)
          </label>

          <textarea
            id={`report-description-${targetType}-${targetId}`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={1000}
            placeholder="Explain why you are reporting this content..."
            rows={3}
          />

          {error && (
            <p className="report-error" role="alert">
              {error}
            </p>
          )}

          <div className="report-form-actions">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError("");
              }}
              disabled={submitting}
            >
              CANCEL
            </button>

            <button type="submit" disabled={submitting}>
              {submitting ? "SUBMITTING..." : "SUBMIT REPORT"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ReportButton;