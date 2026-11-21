
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/create-post.css";

function CreatePost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [images, setImages] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImagesChange(event) {
    const selectedImages = Array.from(event.target.files || []);

    setImages(selectedImages);
    setCaptions(selectedImages.map(() => ""));
  }

  function handleCaptionChange(index, value) {
    setCaptions((previous) =>
      previous.map((caption, i) =>
        i === index ? value : caption
      )
    );
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

    images.forEach((image) => {
      formData.append("uploaded_images", image);
    });

    captions.forEach((caption) => {
      formData.append("image_captions", caption);
    });

    try {
      setLoading(true);

      const response = await api.post("posts/", formData);

      navigate("/admin", {
        replace: true,
        state: {
          message: `Post "${response.data.title}" created successfully.`,
        },
      });
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const messages = Object.entries(data).map(
          ([field, value]) => {
            const detail = Array.isArray(value)
              ? value.join(", ")
              : typeof value === "string"
                ? value
                : JSON.stringify(value);

            return `${field}: ${detail}`;
          }
        );

        setError(messages.join(" | "));
      } else {
        setError("Unable to create the post. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="create-post-page">
      <header className="create-post-header">
        <div>
          <p className="create-post-eyebrow">
            SHADOWSCAGE / ADMIN / CONTENT
          </p>
          <h1>Create New Post</h1>
          <p>Write and publish a new article.</p>
        </div>

        <Link to="/admin" className="create-post-back">
          ← Dashboard
        </Link>
      </header>

      <form className="create-post-form" onSubmit={handleSubmit}>
        {error && (
          <div className="create-post-error">
            {error}
          </div>
        )}

        <div className="create-post-field">
          <label htmlFor="post-title">Post Title</label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            placeholder="Enter your post title..."
            required
          />
          <small>{title.length}/200 characters</small>
        </div>

        <div className="create-post-field">
          <label htmlFor="post-content">Post Content</label>
          <textarea
            id="post-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your article..."
            rows={14}
            required
          />
        </div>

        <div className="create-post-field">
          <label htmlFor="post-status">Publication Status</label>
          <select
            id="post-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="draft">Save as Draft</option>
            <option value="published">Publish Immediately</option>
          </select>
        </div>

        <div className="create-post-field">
          <label htmlFor="post-images">Upload Images</label>
          <input
            id="post-images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
          />
          <small>
            You can select multiple images.
          </small>
        </div>

        {images.length > 0 && (
          <section className="create-post-images">
            <h2>Selected Images ({images.length})</h2>

            {images.map((image, index) => (
              <div className="create-post-image-item" key={`${image.name}-${index}`}>
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

        <div className="create-post-actions">
          <Link to="/admin" className="create-post-cancel">
            Cancel
          </Link>

          <button type="submit" disabled={loading}>
            {loading
              ? "SAVING..."
              : status === "published"
                ? "PUBLISH POST"
                : "SAVE DRAFT"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default CreatePost;
