
import "../styles/navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* BRAND */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon">
            <span>SC</span>
          </div>

          <div className="navbar-brand-text">
            <span className="navbar-logo">
              SHADOWS<span>/</span>CAGE
            </span>

            <span className="navbar-subtitle">
              CYBER INTELLIGENCE NETWORK
            </span>
          </div>
        </Link>

        {/* SYSTEM CLASSIFICATION */}
        <div className="navbar-classification">
          <span className="classification-indicator" />
          <span>SECURE CONNECTION</span>
          <span className="classification-divider">/</span>
          <span className="classification-level">RESTRICTED</span>
        </div>

        {/* AUTHENTICATION */}
        <div className="navbar-account">
          {loading ? (
            <span className="navbar-loading">
              VERIFYING ACCESS...
            </span>
          ) : isAuthenticated && user ? (
            <div className="nav-user-panel">

              <div className="nav-user-info">
                <span className="nav-status-dot" />

                <div className="nav-user-details">
                  <span className="nav-user-label">
                    AUTHENTICATED AS
                  </span>

                  <span className="nav-username">
                    {user.username.toUpperCase()}
                  </span>
                </div>

                {user.is_staff && (
                  <span className="nav-admin-badge">
                    ADMIN
                  </span>
                )}
              </div>

              <div className="nav-user-actions">
                {user.is_staff && (
                  <Link to="/admin" className="nav-link">
                    <span className="nav-link-marker">/</span>
                    OPERATIONS
                  </Link>
                )}

                <Link to="/profile" className="nav-link">
                  <span className="nav-link-marker">/</span>
                  PROFILE
                </Link>

                <button
                  type="button"
                  className="nav-logout-button"
                  onClick={handleLogout}
                >
                  <span>↗</span>
                  TERMINATE SESSION
                </button>
              </div>
            </div>
          ) : (
            <div className="nav-guest-actions">
              <Link to="/login" className="nav-login">
                EXISTING ACCESS
              </Link>

              <Link to="/register" className="nav-register">
                REQUEST ACCESS
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
