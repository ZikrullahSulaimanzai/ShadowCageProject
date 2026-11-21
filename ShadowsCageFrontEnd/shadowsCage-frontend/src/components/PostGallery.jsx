import "./PostGallery.css";
const API_ORIGIN = "http://127.0.0.1:8000";

function getImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function PostGallery({ images = [] }) {
  const validImages = images.filter(
    (item) => item && (typeof item === "string" || item.image || item.url || item.image_url)
  );

  if (validImages.length === 0) {
    return null;
  }

  return (
    <div className="post-gallery">
      {validImages.map((item, index) => {
        const imagePath =
          typeof item === "string"
            ? item
            : item.image || item.url || item.image_url;

        const imageUrl = getImageUrl(imagePath);

        return (
          <figure className="post-gallery-item" key={item.id || index}>
            <img
              src={imageUrl}
              alt={item.caption || `Post image ${index + 1}`}
              className="post-image"
              loading="lazy"
            />

            {item.caption && <figcaption>{item.caption}</figcaption>}
          </figure>
        );
      })}
    </div>
  );
}

export default PostGallery;
