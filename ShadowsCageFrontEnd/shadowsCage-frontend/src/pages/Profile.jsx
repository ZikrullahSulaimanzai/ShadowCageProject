
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

function Profile() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-message">
          Loading user profile...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-message">
          Unable to load your profile.
        </div>
      </main>
    );
  }

  const joinedDate = user.date_joined
    ? new Date(user.date_joined).toLocaleDateString()
    : "Not available";

  return (
    <main className="profile-page">
      <div className="profile-container">

        <div className="profile-header">
          <span className="profile-overline">
            SHADOWSCAGE // USER MANAGEMENT
          </span>

          <h1>USER PROFILE</h1>

          <p>
            Your account information and personal details.
          </p>
        </div>

        <section className="profile-card">

          <div className="profile-identity">
            <div className="profile-avatar">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={`${user.username}'s profile`}
                />
              ) : (
                user.username?.charAt(0).toUpperCase()
              )}
            </div>

            <div className="profile-identity-info">
              <h2>{user.username}</h2>

              <span className="profile-status">
                <span className="profile-status-dot" />
                ACCOUNT ACTIVE
              </span>
            </div>
          </div>

          <div className="profile-divider" />

          <div className="profile-information">

            <div className="profile-field">
              <span className="profile-field-label">
                USER ID
              </span>

              <span className="profile-field-value">
                #{user.id}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">
                USERNAME
              </span>

              <span className="profile-field-value">
                {user.username}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">
                EMAIL ADDRESS
              </span>

              <span className="profile-field-value">
                {user.email || "Not provided"}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">
                ACCOUNT TYPE
              </span>

              <span
                className={`profile-role ${
                  isAdmin ? "profile-role-admin" : ""
                }`}
              >
                {isAdmin ? "ADMINISTRATOR" : "REGULAR USER"}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">
                DATE JOINED
              </span>

              <span className="profile-field-value">
                {joinedDate}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">
                AUTHENTICATION
              </span>

              <span className="profile-field-value profile-authenticated">
                JWT AUTHENTICATED
              </span>
            </div>

          </div>

          <div className="profile-divider" />

          <div className="profile-bio-section">
            <span className="profile-field-label">
              BIOGRAPHY
            </span>

            <p>
              {user.bio?.trim() || "No biography added yet."}
            </p>
          </div>

          <div className="profile-divider" />

          <div className="profile-actions">
              <Link
                to="/posts"
                className="profile-action-button profile-back-button"
                >
                BACK TO POSTS
            </Link>

            <Link
                to="/profile/edit"
                className="profile-action-button profile-edit-button"
                >
                EDIT PROFILE
            </Link>

            <Link
                to="/profile/change-password"
                className="profile-action-button profile-edit-button"
                >
                CHANGE PASSWORD
            </Link>
        </div>

        </section>

        <p className="profile-footer">
          SHADOWSCAGE SECURITY SYSTEM // PROFILE MODULE
        </p>

      </div>
    </main>
  );
}

export default Profile;
