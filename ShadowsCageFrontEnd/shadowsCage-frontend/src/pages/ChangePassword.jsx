
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/change-password.css";

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function getErrorMessage(data) {
    if (!data) {
      return "Something went wrong. Please try again.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    return Object.entries(data)
      .map(([field, messages]) => {
        const message = Array.isArray(messages)
          ? messages.join(" ")
          : String(messages);

        return `${field.replaceAll("_", " ")}: ${message}`;
      })
      .join(" ");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError("Please complete all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setError(
        "Your new password must be different from your current password."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.post(
        "auth/change-password/",
        {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_new_password: confirmPassword,
        }
      );

      setSuccess(
        response.data.message ||
        "Your password has been changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Password change failed:", err);

      setError(
        getErrorMessage(err.response?.data)
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="change-password-page">
      <div className="change-password-container">

        <header className="change-password-header">
          <span className="change-password-overline">
            SHADOWSCAGE // ACCOUNT SECURITY
          </span>

          <h1>CHANGE PASSWORD</h1>

          <p>
            Update your account password to keep your
            account secure.
          </p>
        </header>

        <section className="change-password-card">

          <div className="change-password-notice">
            <span className="change-password-notice-icon">
              !
            </span>

            <p>
              You must enter your current password before
              setting a new one.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="password-field">
              <label htmlFor="current-password">
                CURRENT PASSWORD
              </label>

              <div className="password-input-wrapper">
                <input
                  id="current-password"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  aria-label={
                    showCurrent
                      ? "Hide current password"
                      : "Show current password"
                  }
                >
                  {showCurrent ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <div className="password-field">
              <label htmlFor="new-password">
                NEW PASSWORD
              </label>

              <div className="password-input-wrapper">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  aria-label={
                    showNew
                      ? "Hide new password"
                      : "Show new password"
                  }
                >
                  {showNew ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <div className="password-field">
              <label htmlFor="confirm-password">
                CONFIRM NEW PASSWORD
              </label>

              <div className="password-input-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(!showConfirm)
                  }
                  aria-label={
                    showConfirm
                      ? "Hide password confirmation"
                      : "Show password confirmation"
                  }
                >
                  {showConfirm ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="password-alert password-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="password-alert password-success"
                role="status"
              >
                {success}
              </div>
            )}

            <div className="change-password-actions">
              <Link
                to="/profile"
                className="password-cancel-button"
              >
                CANCEL
              </Link>

              <button
                type="submit"
                className="password-save-button"
                disabled={saving}
              >
                {saving ? "UPDATING..." : "UPDATE PASSWORD"}
              </button>
            </div>

          </form>
        </section>

        <p className="change-password-footer">
          SHADOWSCAGE SECURITY SYSTEM // PASSWORD MANAGEMENT
        </p>

      </div>
    </main>
  );
}

export default ChangePassword;
