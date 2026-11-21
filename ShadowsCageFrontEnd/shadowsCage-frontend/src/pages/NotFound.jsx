import { Link } from "react-router-dom";
import "../styles/not-found.css";

function NotFound() {
  return (
    <main className="not-found">
      <div className="not-found-panel">
        <span className="not-found-label">
          <span className="not-found-indicator" />
          SYSTEM RESPONSE // 404
        </span>

        <h1>404</h1>

        <h2>INTELLIGENCE NOT FOUND</h2>

        <p>
          The requested resource could not be located in the archive.
          It may have been moved, deleted, or never existed.
        </p>

        <div className="not-found-divider" />

        <span className="not-found-code">
          ERROR_CODE: RESOURCE_UNAVAILABLE
        </span>

        <Link to="/" className="not-found-link">
          RETURN TO BASE
        </Link>
      </div>

      <span className="not-found-footer">
        SHADOWS/CAGE // ARCHIVE SYSTEM
      </span>
    </main>
  );
}

export default NotFound;