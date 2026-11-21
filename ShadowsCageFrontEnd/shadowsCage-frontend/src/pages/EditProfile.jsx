
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/edit-profile.css";

function EditProfile() {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user]);

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The profile picture must be smaller than 5 MB.");
      return;
    }

    setError("");
    setAvatar(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("Username cannot be empty.");
      return;
    }

    if (!email.trim()) {
      setError("Email address cannot be empty.");
      return;
    }

    const formData = new FormData();

    formData.append("username", username.trim());
    formData.append("email", email.trim());
    formData.append("bio", bio.trim());

    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      setSaving(true);

      await api.patch("auth/me/", formData);

      await refreshUser();

      setSuccess("Your profile was updated successfully.");

      navigate("/profile", { replace: true });
    } catch (err) {
      console.error("Profile update failed:", err);

      const data = err.response?.data;

      if (data && typeof data === "object") {
        const messages = Object.entries(data)
          .map(([field, messages]) => {
            const detail = Array.isArray(messages)
              ? messages.join(" ")
              : String(messages);

            return `${field}: ${detail}`;
          });

        setError(messages.join(" "));
      } else {
        setError(
          "Unable to update your profile. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="edit-profile-page">
        <p className="edit-profile-message">
          Loading account information...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="edit-profile-page">
        <p className="edit-profile-message">
          You must be logged in to edit your profile.
        </p>
      </main>
    );
  }

  return (
    <main className="edit-profile-page">
      <div className="edit-profile-container">

        <header className="edit-profile-header">
          <span className="edit-profile-overline">
            SHADOWSCAGE // ACCOUNT SETTINGS
          </span>

          <h1>EDIT PROFILE</h1>

          <p>
            Update your account information and personal details.
          </p>
        </header>

        <form
          className="edit-profile-card"
          onSubmit={handleSubmit}
        >
          <div className="edit-avatar-section">
            <div className="edit-avatar">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile preview"
                />
              ) : (
                <span>
                  {username.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>

            <div className="edit-avatar-controls">
              <label
                htmlFor="avatar"
                className="edit-avatar-label"
              >
                CHANGE PROFILE PICTURE
              </label>

              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />

              <span>
                JPG, PNG or other supported image formats.
                Maximum 5 MB.
              </span>
            </div>
          </div>

          <div className="edit-profile-divider" />

          <div className="edit-profile-fields">
            <div className="edit-profile-field">
              <label htmlFor="username">
                USERNAME
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                maxLength={150}
                required
              />
            </div>

            <div className="edit-profile-field">
              <label htmlFor="email">
                EMAIL ADDRESS
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <div className="edit-profile-field edit-profile-bio">
              <label htmlFor="bio">
                BIOGRAPHY
              </label>

              <textarea
                id="bio"
                value={bio}
                onChange={(event) =>
                  setBio(event.target.value)
                }
                maxLength={500}
                rows={5}
                placeholder="Tell us a little about yourself..."
              />

              <span className="edit-profile-character-count">
                {bio.length}/500 characters
              </span>
            </div>
          </div>

          {error && (
            <div className="edit-profile-alert edit-profile-error">
              {error}
            </div>
          )}

          {success && (
            <div className="edit-profile-alert edit-profile-success">
              {success}
            </div>
          )}

          <div className="edit-profile-divider" />

          <div className="edit-profile-actions">
            <Link
              to="/profile"
              className="edit-profile-cancel"
            >
              CANCEL
            </Link>

            <button
              type="submit"
              className="edit-profile-save"
              disabled={saving}
            >
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>
        </form>

        <p className="edit-profile-footer">
          SHADOWSCAGE SECURITY SYSTEM // PROFILE EDITOR
        </p>

      </div>
    </main>
  );
}

export default EditProfile;
