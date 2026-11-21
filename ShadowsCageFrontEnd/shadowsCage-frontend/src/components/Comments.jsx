
import { useAuth } from "../context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import ReportButton from "./ReportButton";
import "./Comments.css";

function getCommentCount(comments) {
  return comments.reduce(
    (total, comment) =>
      total + 1 + getCommentCount(comment.replies || []),
    0
  );
}

function CommentItem({
  user,
  onDelete,
  deletingId,
  comment,
  replyingTo,
  setReplyingTo,
  replyBody,
  setReplyBody,
  onReply,
  submitting,
  submitError,
}) {
  const replies = comment.replies || [];
  const isReplying = Boolean(user) && replyingTo === comment.id;

  // Admins can delete every comment.
  // Regular users can delete only their own comments.
  const canDelete =
    user &&
    (user.is_staff || Number(comment.user) === Number(user.id));

  return (
    <article className="comment" id={`comment-${comment.id}`}>
      <div className="comment-header">
        <strong className="comment-author">
          {comment.name || "Unknown User"}
        </strong>

        {comment.created_at && (
          <time dateTime={comment.created_at}>
            {new Date(comment.created_at).toLocaleString()}
          </time>
        )}
      </div>

      <p className="comment-body">{comment.body}</p>

      <div className="comment-actions">
        <button
          type="button"
          className="comment-reply-button"
          onClick={() => {
            if (!user) return;

            setReplyingTo(isReplying ? null : comment.id);
            setReplyBody("");
          }}
        >
          {isReplying ? "Cancel reply" : "↳ Reply"}
        </button>

        {user && (
          <ReportButton
            targetType="comment"
            targetId={comment.id}
          />
        )}

        {canDelete && (
          <button
            type="button"
            className="comment-delete-button"
            onClick={() => onDelete(comment)}
            disabled={deletingId === comment.id}
          >
            {deletingId === comment.id
              ? "DELETING..."
              : "DELETE COMMENT"}
          </button>
        )}
      </div>

      {isReplying && (
        <form
          className="comment-form reply-form"
          onSubmit={(event) => onReply(event, comment.id)}
        >
          <label>
            Your reply
            <textarea
              value={replyBody}
              onChange={(event) => setReplyBody(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Write your reply..."
              required
            />
          </label>

          {submitError && (
            <p className="comments-error">{submitError}</p>
          )}

          <button
            type="submit"
            className="comment-submit-button"
            disabled={submitting}
          >
            {submitting ? "SENDING..." : "POST REPLY"}
          </button>
        </form>
      )}

      {replies.length > 0 && (
        <div className="comment-replies">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              user={user}
              comment={reply}
              onDelete={onDelete}
              deletingId={deletingId}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyBody={replyBody}
              setReplyBody={setReplyBody}
              onReply={onReply}
              submitting={submitting}
              submitError={submitError}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function Comments({ postId }) {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [body, setBody] = useState("");

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyBody, setReplyBody] = useState("");

  // Load comments and replies.
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`posts/${postId}/comments/`);
      const data = response.data;

      setComments(
        Array.isArray(data) ? data : data.results || []
      );
    } catch (err) {
      console.error("Failed to load comments:", err);

      setError(
        err.response?.status === 401
          ? "Please log in to view this discussion."
          : "Comments could not be loaded. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Delete a comment or reply.
  const handleDeleteComment = async (comment) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(comment.id);
      setError("");

      await api.delete(
        `posts/${postId}/comments/${comment.id}/delete/`
      );

      await loadComments();
    } catch (err) {
      console.error("Failed to delete comment:", err);

      setError(
        err.response?.data?.detail ||
          "Could not delete this comment. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Submit a new comment.
  const submitComment = async (event) => {
    event.preventDefault();

    if (!user) {
      setSubmitError("You must log in to comment.");
      return;
    }

    if (!body.trim()) {
      setSubmitError("Please enter your comment.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      await api.post(`posts/${postId}/comments/`, {
        body: body.trim(),
      });

      setBody("");
      await loadComments();
    } catch (err) {
      console.error("Failed to submit comment:", err);

      setSubmitError(
        err.response?.data?.detail ||
          "Your comment could not be submitted. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Submit a reply to another comment or reply.
  const submitReply = async (event, parentId) => {
    event.preventDefault();

    if (!user) {
      setSubmitError("You must log in to reply.");
      return;
    }

    if (!replyBody.trim()) {
      setSubmitError("Please enter your reply.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      await api.post(`posts/${postId}/comments/`, {
        body: replyBody.trim(),
        parent: parentId,
      });

      setReplyingTo(null);
      setReplyBody("");

      await loadComments();
    } catch (err) {
      console.error("Failed to submit reply:", err);

      setSubmitError(
        err.response?.data?.detail ||
          "Your reply could not be submitted. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="comments-section">
      <h2>
        Discussion <span>({getCommentCount(comments)})</span>
      </h2>

      {/* New comment form */}
      {user ? (
        <form className="comment-form" onSubmit={submitComment}>
          <h3>Leave a comment</h3>

          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Share your thoughts..."
            required
          />

          {submitError && !replyingTo && (
            <p className="comments-error">{submitError}</p>
          )}

          <button
            type="submit"
            className="comment-submit-button"
            disabled={submitting}
          >
            {submitting ? "SENDING..." : "COMMENT"}
          </button>
        </form>
      ) : (
        <p className="comments-login-message">
          Log in to participate in the discussion.
        </p>
      )}

      {/* Comments list */}
      <div className="comments-list">
        <h3>Comments and replies</h3>

        {loading && <p>Loading comments...</p>}

        {!loading && error && (
          <div className="comments-error">
            <p>{error}</p>

            <button type="button" onClick={loadComments}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && comments.length === 0 && (
          <p className="comments-empty">
            No comments yet. Start the discussion.
          </p>
        )}

        {!loading &&
          !error &&
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              user={user}
              comment={comment}
              onDelete={handleDeleteComment}
              deletingId={deletingId}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyBody={replyBody}
              setReplyBody={setReplyBody}
              onReply={submitReply}
              submitting={submitting}
              submitError={submitError}
            />
          ))}
      </div>
    </section>
  );
}

export default Comments;
