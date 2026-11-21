
import { Link } from "react-router-dom";
import { ArrowUpRight, FileWarning, ScanEye } from "lucide-react";

const API_ORIGIN = "http://127.0.0.1:8000";

function getImageUrl(url) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function PostCard({ post, index = 0 }) {
  const content = post.content || "";
  const image = post.image_thumbnail || post.images?.[0]?.image;
  const imageUrl = getImageUrl(image);

  const date = post.created_date
    ? new Date(post.created_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "UNDATED";

  return (
    <article
      className="post-card"
      style={{ "--card-index": index }}
    >
      <div className="card-topline">
        <span className="card-file-type">
          <FileWarning size={14} />
          RESEARCH FILE
        </span>
        <span className="card-number">
          FILE_{String(post.id).padStart(3, "0")}
        </span>
      </div>

      <Link
        to={`/posts/${post.id}`}
        className="card-image-link"
        aria-label={`Read ${post.title}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.title}
            className="post-card-image"
            loading="lazy"
          />
        ) : (
          <div className="post-image-placeholder">
            <ScanEye size={58} strokeWidth={1} />
            <span>VISUAL RECORD UNAVAILABLE</span>
          </div>
        )}

        <span className="image-scanline" />
        <span className="image-corner image-corner-tl" />
        <span className="image-corner image-corner-br" />
      </Link>

      <div className="post-card-content">
        <div className="card-meta">
          <span className="card-category">CYBER / ARCHIVE</span>
          <time>{date}</time>
        </div>

        <h2>
          <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </h2>

        <p className="post-excerpt">
          {content.length > 155
            ? `${content.substring(0, 155).trim()}...`
            : content || "The file contains no readable summary. Open it to investigate further."}
        </p>

        <div className="card-bottom">
          <span className="card-status">
            <span className="status-dot" />
            FILE AVAILABLE
          </span>

          <Link to={`/posts/${post.id}`} className="read-more">
            ACCESS FILE <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default PostCard;
