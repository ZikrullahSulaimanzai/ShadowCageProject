
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function Register() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect users who are already authenticated.
  useEffect(() => {
    if (!loading && user) {
      navigate("/posts", { replace: true });
    }
  }, [user, loading, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        password_confirm: passwordConfirm,
      });

      navigate("/posts", { replace: true });
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const detail = Array.isArray(value)
              ? value.join(" ")
              : String(value);

            return `${field}: ${detail}`;
          })
          .join(" ");

        setError(
          messages || "Registration failed. Please try again."
        );
      } else {
        setError(
          "Registration failed. Please check your details and try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="auth-page">
        <p>Checking your session...</p>
      </main>
    );
  }

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
          <UserPlus size={30} />
        </div>

        <p className="auth-kicker">
          // CREATE YOUR IDENTITY
        </p>

        <h1>
          JOIN THE <span>SHADOWS</span>
        </h1>

        <p className="auth-description">
          Create your ShadowsCage account.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="register-username">USERNAME</label>

          <input
            id="register-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Choose a username"
            maxLength={150}
            required
          />

          <label htmlFor="register-email">EMAIL</label>

          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="register-password">PASSWORD</label>

          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            required
          />

          <label htmlFor="register-password-confirm">
            CONFIRM PASSWORD
          </label>

          <input
            id="register-password-confirm"
            type="password"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(event) =>
              setPasswordConfirm(event.target.value)
            }
            placeholder="Enter your password again"
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={submitting}>
            <ShieldCheck size={17} />
            {submitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Log in</Link>
        </p>

        <p className="auth-security">
          SECURE ACCESS // SHADOWSCAGE
        </p>
      </section>
    </main>
  );
}

export default Register;
