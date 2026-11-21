
import PostCard from "./PostCard";
import { Ghost } from "lucide-react";

function PostGrid({ posts }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="empty-state">
        <Ghost size={42} strokeWidth={1} />
        <h3>THE ARCHIVE IS EMPTY</h3>
        <p>No published records were found. Check back after new files arrive.</p>
      </div>
    );
  }

  return (
    <div className="post-grid">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}

export default PostGrid;
