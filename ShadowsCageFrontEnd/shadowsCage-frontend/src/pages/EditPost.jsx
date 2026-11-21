
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "../styles/edit-post.css";

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [captions, setCaptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.is_staff) {
      return;
    }

    let isMounted = true;

    async function fetchPost() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`posts/${id}/`);
        const post = response.data;

        if (isMounted) {
          setTitle(post.title || "");
          setContent(post.content || "");
          setStatus(post.status || "draft");
          setExistingImages(post.images || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.detail ||
              "Unable to load this post."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [id, authLoading, isAuthenticated, user]);

  if (authLoading) {
    return (
      <main className="edit-post-page">
        <p>Checking administrator access...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_staff) {
    return <Navigate to="/posts" replace />;
  }

  function handleImagesChange(event) {
    const selectedImages = Array.from(event.target.files || []);

    setNewImages(selectedImages);
    setCaptions(selectedImages.map(() => ""));
  }

  function handleCaptionChange(index, value) {
    setCaptions((previous) =>
      previous.map((caption, i) =>
        i === index ? value : caption
      )
    );
  }

  function getErrorMessage(data) {
    if (!data || typeof data !== "object") {
      return "Unable to update the post. Please try again.";
    }

    return Object.entries(data)
      .map(([field, value]) => {
        const detail = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "string"
            ? value
            : JSON.stringify(value);

        return `${field}: ${detail}`;
      })
      .join(" | ");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    const formData = new FormData();

    formData.append("title", title.trim());
    formData.append("content", content);
    formData.append("status", status);

    newImages.forEach((image) => {
      formData.append("uploaded_images", image);
    });

    if (newImages.length > 0) {
      captions.forEach((caption) => {
        formData.append("image_captions", caption);
      });
    }

    try {
      setSaving(true);

      await api.patch(`posts/${id}/`, formData);

      navigate("/admin", {
        replace: true,
        state: {
          message: `Post "${title.trim()}" updated successfully.`,
        },
      });
    } catch (err) {
      setError(getErrorMessage(err.response?.data));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="edit-post-page">
        <p className="edit-post-message">
          Loading post...
        </p>
      </main>
    );
  }

  return (
    <main className="edit-post-page">
      <header className="edit-post-header">
        <div>
          <p className="edit-post-eyebrow">
            SHADOWSCAGE / ADMIN / CONTENT
          </p>

          <h1>Edit Post</h1>

          <p>Update your article and publication settings.</p>
        </div>

        <Link to="/admin" className="edit-post-back">
          ← Dashboard
        </Link>
      </header>

      {error && (
        <div className="edit-post-error">
          {error}
        </div>
      )}

      <form className="edit-post-form" onSubmit={handleSubmit}>
        <div className="edit-post-field">
          <label htmlFor="edit-title">Post Title</label>

          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            required
          />

          <small>{title.length}/200 characters</small>
        </div>

        <div className="edit-post-field">
          <label htmlFor="edit-content">Post Content</label>

          <textarea
            id="edit-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={14}
            required
          />
        </div>

        <div className="edit-post-field">
          <label htmlFor="edit-status">
            Publication Status
          </label>

          <select
            id="edit-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Existing Images */}
        <section className="edit-post-images">
          <h2>Existing Images ({existingImages.length})</h2>

          {existingImages.length === 0 ? (
            <p className="edit-post-muted">
              This post has no images.
            </p>
          ) : (
            <div className="edit-post-image-grid">
              {existingImages.map((image) => (
                <article
                  className="edit-post-image-card"
                  key={image.id}
                >
                  {image.image_url && (
                    <img
                      src={image.image_url}
                      alt={image.caption || title}
                    />
                  )}

                  <p>
                    {image.caption || "No caption"}
                  </p>
                </article>
              ))}
            </div>
          )}

          <p className="edit-post-muted">
            Existing images will be kept when you save changes.
          </p>
        </section>

        {/* Add New Images */}
        <div className="edit-post-field">
          <label htmlFor="edit-images">
            Add More Images
          </label>

          <input
            id="edit-images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
          />

          <small>
            Newly selected images will be added to the existing images.
          </small>
        </div>

        {newImages.length > 0 && (
          <section className="edit-post-new-images">
            <h2>New Images ({newImages.length})</h2>

            {newImages.map((image, index) => (
              <div
                className="edit-post-new-image"
                key={`${image.name}-${index}`}
              >
                <div>
                  <strong>{image.name}</strong>
                  <small>
                    {(image.size / (1024 * 1024)).toFixed(2)} MB
                  </small>
                </div>

                <input
                  type="text"
                  value={captions[index]}
                  onChange={(event) =>
                    handleCaptionChange(index, event.target.value)
                  }
                  placeholder="Image caption (optional)"
                  aria-label={`Caption for ${image.name}`}
                />
              </div>
            ))}
          </section>
        )}

        <div className="edit-post-actions">
          <Link to="/admin" className="edit-post-cancel">
            Cancel
          </Link>

          <button type="submit" disabled={saving}>
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default EditPost;
