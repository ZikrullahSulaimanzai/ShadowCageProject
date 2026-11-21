
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  FileWarning,
  Fingerprint,
  ShieldAlert,
  Skull,
} from "lucide-react";

import { getPost } from "../api/postsApi";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import PostGallery from "../components/PostGallery";
import Comments from "../components/Comments";
import ReportButton from "../components/ReportButton";
import "../styles/post.css";

function PostDetail() {
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPost() {
      setLoading(true);
      setError("");

      try {
        const data = await getPost(id);
        if (active) setPost(data);
      } catch (err) {
        console.error("Failed to load post:", err);
        if (active) {
          setError("The requested archive file could not be retrieved.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPost();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <main className="detail-state"><Loading /></main>;
  }

  if (error) {
    return <main className="detail-state"><ErrorMessage message={error} /></main>;
  }

  if (!post) {
    return (
      <main className="detail-state">
        <ErrorMessage message="Archive file not found." />
      </main>
    );
  }

  const createdDate = post.created_date
    ? new Date(post.created_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const updatedDate =
    post.updated_date && post.updated_date !== post.created_date
      ? new Date(post.updated_date).toLocaleDateString()
      : null;

  return (
    <main className="detail-page">
      <div className="scanlines" aria-hidden="true" />
      <div className="detail-ambient" aria-hidden="true" />

      <div className="detail-container">
        <nav className="detail-navigation">
          <Link to="/posts" className="back-link">
            <ArrowLeft size={17} />
            RETURN TO ARCHIVES
          </Link>

          <span className="detail-breadcrumb">
            SHADOWSCAGE <span>/</span> FILE_{String(post.id).padStart(3, "0")}
          </span>
        </nav>

        <div className="detail-statusbar">
          <span><span className="status-dot" /> RECORD ACCESSED</span>
          <span><ShieldAlert size={15} /> CLASSIFICATION: RESEARCH</span>
          <span><Fingerprint size={15} /> ID: SC-{post.id}</span>
        </div>

        <article className="post-article">
          <header className="post-detail-header">
            <div className="article-kicker">
              <FileWarning size={16} />
              <span>INTELLIGENCE REPORT // DIGITAL ARCHIVE</span>
            </div>

            <h1>{post.title}</h1>

            <div className="post-detail-meta">
              {createdDate && (
                <span>
                  <CalendarDays size={15} />
                  PUBLISHED {createdDate}
                </span>
              )}

              <span>
                <Eye size={15} />
                SHADOWSCAGE RESEARCH
              </span>
            </div>
          </header>

          <div className="article-warning">
            <div className="warning-icon"><Skull size={23} /></div>
            <div>
              <strong>ARCHIVE NOTICE</strong>
              <p>
                Read the report carefully. Verify information before applying
                any technical instructions.
              </p>
            </div>
            <span className="warning-mark">!</span>
          </div>

          <PostGallery images={post.images || []} />

          <div className="post-body">
            {post.content || "No content is available for this file."}
          </div>

          <div className="post-report-section">
            <ReportButton
              targetType="post"
              targetId={post.id}
            />
          </div>

          {updatedDate && (
            <p className="post-updated">
              LAST MODIFIED: {updatedDate}
            </p>
          )}
        </article>

        <aside className="article-end">
          <div className="end-icon"><Eye size={22} /></div>
          <div>
            <strong>END OF TRANSMISSION</strong>
            <p>You have reached the end of this archive file.</p>
          </div>
          <Link to="/" className="return-button">
            BACK TO ARCHIVES <ArrowLeft size={16} />
          </Link>
        </aside>

        <section className="detail-comments">
          <div className="comments-heading">
            <p className="section-eyebrow">// OPEN CHANNEL</p>
            <h2>THE <span>DISCUSSION</span></h2>
            <p>Messages left by visitors to this archive.</p>
          </div>

          <Comments postId={post.id} />
        </section>

        <footer className="detail-footer">
          <span>SHADOWSCAGE<span className="footer-red">_</span></span>
          <span>CONNECTION ENCRYPTED // SESSION ACTIVE</span>
        </footer>
      </div>
    </main>
  );
}

export default PostDetail;
