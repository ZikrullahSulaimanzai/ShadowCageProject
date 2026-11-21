
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function Login() {
  const { login, user, loading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect authenticated users away from the login page.
  useEffect(() => {
    if (!loading && user) {
      navigate("/posts", { replace: true });
    }
  }, [user, loading, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(username.trim(), password);

      const destination =
        location.state?.from?.pathname || "/posts";

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Check your username and password."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Wait until AuthContext finishes checking the saved session.
  if (loading) {
    return (
      <main className="auth-page">
        <p>Checking your session...</p>
      </main>
    );
  }

  // Don't display the login form to an authenticated user.
  if (user) {
    return null;
  }

  return (
    <main className="auth-page">
      <Link to="/" className="welcome-logo">
        <ShieldAlert size={28} />
        <span>
          SHADOWS<span className="accent">CAGE</span>
        </span>
      </Link>

      <section className="auth-panel">
        <div className="auth-icon">
          <LockKeyhole size={30} />
        </div>

        <p className="auth-kicker">
          // IDENTITY VERIFICATION
        </p>

        <h1>
          ACCESS THE <span>SHADOWS</span>
        </h1>

        <p className="auth-description">
          Sign in to your ShadowsCage account.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-username">USERNAME</label>

          <input
            id="login-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            placeholder="Enter your username"
            required
          />

          <label htmlFor="login-password">PASSWORD</label>

          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            required
          />

          {error && (
            <p className="auth-error">{error}</p>
          )}

          <button type="submit" disabled={submitting}>
            <ShieldCheck size={17} />
            {submitting ? "VERIFYING..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>

        <p className="auth-security">
          SECURE ACCESS // SHADOWSCAGE
        </p>
      </section>
    </main>
  );
}

export default Login;
