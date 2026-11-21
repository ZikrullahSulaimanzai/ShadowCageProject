
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Terminal,
  LockKeyhole,
  ArrowRight,
} from "lucide-react";
import "../styles/welcome.css";

export default function Welcome() {
  return (
    <main className="welcome-page">
      <div className="welcome-grid" />

      <nav className="welcome-nav">
        <Link to="/" className="welcome-logo">
          <ShieldAlert size={28} />
          <span>SHADOWS<span className="accent">CAGE</span></span>
        </Link>

        <div className="welcome-nav-links">
          <Link to="/login">Login</Link>
          <Link to="/register" className="register-link">
            Register
          </Link>
        </div>
      </nav>

      <section className="welcome-hero">
        <div className="welcome-status">
          <span className="status-dot" />
          SECURE CONNECTION ESTABLISHED
        </div>

        <div className="welcome-icon">
          <Terminal size={42} />
        </div>

        <p className="welcome-eyebrow">ENTER THE DIGITAL UNDERWORLD</p>

        <h1>
          WELCOME TO
          <br />
          <span>SHADOWSCAGE</span>
        </h1>

        <p className="welcome-description">
          Explore the shadows of cybersecurity. Discover technical
          articles, security insights, digital threats, and knowledge
          hidden beneath the surface.
        </p>

        <div className="welcome-actions">
          <Link to="/posts" className="enter-button">
            Enter the Archive <ArrowRight size={18} />
          </Link>

          <Link to="/register" className="secondary-button">
            Create Account
          </Link>
        </div>

        <div className="welcome-features">
          <div>
            <LockKeyhole size={20} />
            <span>SECURE ACCESS</span>
          </div>
          <div>
            <Terminal size={20} />
            <span>TECHNICAL KNOWLEDGE</span>
          </div>
          <div>
            <ShieldAlert size={20} />
            <span>CYBERSECURITY</span>
          </div>
        </div>
      </section>

      <footer className="welcome-footer">
        <span>SHADOWSCAGE // KNOWLEDGE IS POWER</span>
        <span>ACCESS RESTRICTED TO AUTHORIZED USERS</span>
      </footer>
    </main>
  );
}
