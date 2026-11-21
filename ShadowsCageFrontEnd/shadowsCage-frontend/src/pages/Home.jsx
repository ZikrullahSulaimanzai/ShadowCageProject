
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Eye,
  Ghost,
  ShieldAlert,
  Skull,
  Terminal,
  Search,
  X,
  Lock,
} from "lucide-react";

import { getPosts } from "../api/postsApi";
import PostGrid from "../components/PostGrid";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import "../styles/home.css";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPosts(search);

        if (active) {
          setPosts(data);
        }
      } catch (err) {
        console.error("Failed to load posts:", err);

        if (active) {
          setError("Connection lost. The intelligence archive is unreachable.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, search.trim() ? 400 : 0);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [search]);

  return (
    <main className="home-page">
      <div className="home-scanlines" aria-hidden="true" />
      <div className="home-grid-overlay" aria-hidden="true" />

      {/* HERO / INTELLIGENCE INTRO */}
      <section className="horror-hero">
        <div className="hero-content">
          <div className="hero-classification">
            <span className="hero-status-dot" />
            <span>NETWORK STATUS: ONLINE</span>
            <span className="classification-separator">/</span>
            <span className="classification-restricted">
              CLASSIFIED ACCESS
            </span>
          </div>

          <p className="hero-kicker">
            <Terminal size={14} />
            INDEPENDENT CYBERSECURITY INTELLIGENCE
          </p>

          <h1 className="hero-title">
            SHADOWS<span>CAGE</span>
          </h1>

          <div className="hero-divider">
            <span />
            <span>INTELLIGENCE ARCHIVE // 001</span>
          </div>

          <h2 className="hero-subtitle">
            THE NETWORK HAS
            <br />
            <span>NO SAFE SHADOWS.</span>
          </h2>

          <p className="hero-description">
            Investigate digital threats. Understand vulnerabilities.
            Explore the systems, techniques, and hidden risks shaping
            the underground world of cybersecurity.
          </p>

          <div className="hero-actions">
            <a href="#latest-posts" className="hero-primary-button">
              <Lock size={15} />
              ACCESS THE ARCHIVE
              <ArrowRight size={15} />
            </a>

            <a href="#about-shadows" className="hero-secondary-button">
              <Eye size={15} />
              ABOUT THE NETWORK
            </a>
          </div>

          <div className="hero-terminal">
            <span className="terminal-prompt">operator@shadowscage:~$</span>
            <span className="terminal-command"> initialize --intelligence</span>
            <span className="terminal-result"> [ACCESS GRANTED]</span>
            <span className="terminal-cursor">_</span>
          </div>
        </div>

        {/* VISUAL INTELLIGENCE PANEL */}
        <div className="hero-art">
          <div className="art-topline">
            <span>FIG. 001 // UNKNOWN ENTITY</span>
            <span>LIVE MONITORING</span>
          </div>

          <div className="art-main">
            <div className="art-crosshair crosshair-top-left" />
            <div className="art-crosshair crosshair-top-right" />
            <div className="art-crosshair crosshair-bottom-left" />
            <div className="art-crosshair crosshair-bottom-right" />

            <div className="art-ring ring-one" />
            <div className="art-ring ring-two" />

            <div className="horror-emblem">
              <Skull className="hero-skull" strokeWidth={1} />
            </div>

            <div className="art-center-label">
              <span>ENTITY DETECTED</span>
              <strong>UNKNOWN</strong>
            </div>
          </div>

          <div className="art-data">
            <div>
              <span className="data-label">ORIGIN</span>
              <strong>UNIDENTIFIED</strong>
            </div>

            <div>
              <span className="data-label">THREAT LEVEL</span>
              <strong className="data-danger">UNCLASSIFIED</strong>
            </div>

            <div>
              <span className="data-label">CONTAINMENT</span>
              <strong>NOT CONFIRMED</strong>
            </div>
          </div>

          <div className="art-bottomline">
            <Activity size={13} />
            MONITORING UNKNOWN ACTIVITY
          </div>
        </div>

        <a href="#latest-posts" className="hero-scroll">
          <ArrowDown size={14} />
          SCROLL TO INTELLIGENCE
        </a>

        <div className="hero-index">SC // 00-01</div>
      </section>

      {/* TOPIC STRIP */}
      <section className="threat-strip" aria-label="Archive categories">
        <span><ShieldAlert size={14} /> CYBERSECURITY</span>
        <span><Terminal size={14} /> DIGITAL FORENSICS</span>
        <span><Eye size={14} /> THREAT RESEARCH</span>
        <span><Ghost size={14} /> UNDERGROUND INTELLIGENCE</span>
      </section>

      {/* ARCHIVE */}
      <section className="latest-section" id="latest-posts">
        <div className="archive-header">
          <div className="archive-heading-copy">
            <p className="section-eyebrow">
              <span>//</span> DATABASE ACCESS GRANTED
            </p>

            <h2>
              INTELLIGENCE
              <span> ARCHIVE</span>
            </h2>

            <p className="section-description">
              Collected research, technical reports, and field intelligence.
            </p>
          </div>

          <div className="archive-counter">
            <span className="counter-indicator" />
            <div>
              <span className="counter-label">AVAILABLE RECORDS</span>
              <strong>{posts.length.toString().padStart(2, "0")}</strong>
            </div>
          </div>
        </div>

        <div className="archive-toolbar">
          <div className="toolbar-title">
            <span className="toolbar-marker" />
            RECORD SEARCH
          </div>

          <span className="toolbar-classification">
            INTERNAL DATABASE // SEARCH ENABLED
          </span>
        </div>

        <div className="archive-search">
          <div className="search-input-wrapper">
            <Search size={17} className="search-icon" />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records, vulnerabilities, reports..."
              aria-label="Search posts"
            />

            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}

            <span className="search-shortcut">SEARCH</span>
          </div>

          <p className="search-hint">
            <Terminal size={12} />
            QUERY THE INTELLIGENCE DATABASE
          </p>
        </div>

        <div className="archive-results-heading">
          <span>/// RECOVERED RECORDS</span>
          <span>{loading ? "RETRIEVING..." : `${posts.length} RECORD(S)`}</span>
        </div>

        {loading && <Loading />}

        {error && <ErrorMessage message={error} />}

        {!loading && !error && posts.length > 0 && (
          <PostGrid posts={posts} />
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="no-search-results">
            <div className="empty-icon">
              <Search size={25} />
            </div>

            <p className="empty-code">ERROR // 404-RECORD</p>

            <h3>NO RECORDS RECOVERED</h3>

            <p>
              {search.trim()
                ? `No intelligence records match "${search}". Try a different query.`
                : "The archive contains no published records at this time."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="clear-search-button"
              >
                RESET SEARCH
              </button>
            )}
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about-shadows">
        <div className="about-icon">
          <Eye size={25} />
        </div>

        <div className="about-content">
          <p className="section-eyebrow">
            <span>//</span> BEHIND THE SHADOWS
          </p>

          <h2>
            KNOW YOUR
            <span> DIGITAL ENEMY.</span>
          </h2>

          <p>
            ShadowsCage is an independent cybersecurity knowledge archive
            focused on research, digital threats, vulnerabilities, and
            practical technical learning. We believe understanding the
            threat is the first step toward defending against it.
          </p>

          <div className="about-tags">
            <span>RESEARCH</span>
            <span>DEFENSE</span>
            <span>KNOWLEDGE</span>
            <span>ETHICAL SECURITY</span>
          </div>
        </div>

        <div className="about-watermark" aria-hidden="true">
          SC
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-brand">
          SHADOWS<span>/</span>CAGE
        </div>

        <span className="footer-message">
          KNOWLEDGE IS THE STRONGEST DEFENSE.
        </span>

        <span className="footer-status">
          <span />
          SYSTEM ACTIVE
        </span>
      </footer>
    </main>
  );
}

export default Home;
