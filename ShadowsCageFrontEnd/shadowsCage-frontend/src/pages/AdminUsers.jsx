
import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "../styles/admin-users.css";

function AdminUsers() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  
  const [actionUserId, setActionUserId] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("admin/users/");
      const data = response.data;

      setUsers(
        Array.isArray(data) ? data : data.results || []
      );
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.is_staff) {
      loadUsers();
    }
  }, [authLoading, isAuthenticated, user, loadUsers]);

  if (authLoading) {
    return <main className="admin-users-page">Checking access...</main>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_staff) {
    return <Navigate to="/posts" replace />;
  }

  async function handleToggleStatus(targetUser) {
    const action = targetUser.is_active ? "deactivate" : "reactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${targetUser.username}?`
    );

    if (!confirmed) return;

    try {
      setActionUserId(targetUser.id);
      setError("");
      setNotice("");

      const response = await api.patch(
        `admin/users/${targetUser.id}/`,
        {
          is_active: !targetUser.is_active,
        }
      );

      setUsers((previous) =>
        previous.map((item) =>
          item.id === targetUser.id ? response.data : item
        )
      );

      setNotice(
        `${targetUser.username} was ${action}d successfully.`
      );
    } catch (err) {
      console.error("Failed to update user:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to update this account."
      );
    } finally {
      setActionUserId(null);
    }
  }

  async function handleDeleteUser(targetUser) {
    const confirmed = window.confirm(
      `PERMANENTLY DELETE ${targetUser.username}?\n\nThis action cannot be undone. Their profile will be removed. Historical comments will remain without an account association.`
    );

    if (!confirmed) return;

    try {
      setActionUserId(targetUser.id);
      setError("");
      setNotice("");

      await api.delete(`admin/users/${targetUser.id}/`);

      setUsers((previous) =>
        previous.filter((item) => item.id !== targetUser.id)
      );

      setNotice(
        `User ${targetUser.username} was permanently deleted.`
      );
    } catch (err) {
      console.error("Failed to delete user:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete this account."
      );
    } finally {
      setActionUserId(null);
    }
  }

  return (
    <main className="admin-users-page">
      <header className="admin-users-header">
        <div>
          <p className="admin-users-eyebrow">
            SHADOWSCAGE / USER CONTROL
          </p>

          <h1>User Management</h1>

          <p>
            View and manage registered user accounts.
          </p>
        </div>

        <Link to="/admin" className="admin-users-back-button">
          ← BACK TO DASHBOARD
        </Link>
      </header>

      {notice && (
        <div className="admin-users-success">{notice}</div>
      )}

      {error && (
        <div className="admin-users-error">
          {error}
        </div>
      )}


      <section className="admin-user-list-section">
        <div className="admin-user-list-header">
          <div>
            <h2>Registered Users</h2>
            <p>Manage existing accounts.</p>
          </div>

          <span>{users.length} USERS</span>
        </div>

        {loading ? (
          <p className="admin-users-message">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="admin-users-message">
            No users found.
          </p>
        ) : (
          <div className="admin-users-list">
            {users.map((targetUser) => (
              <article
                className="admin-user-row"
                key={targetUser.id}
              >
                <div className="admin-user-info">
                  <strong>{targetUser.username}</strong>

                  <span>{targetUser.email || "No email"}</span>

                  <small>
                    Joined:{" "}
                    {new Date(
                      targetUser.date_joined
                    ).toLocaleDateString()}
                  </small>

                  <div className="admin-user-badges">
                    <span
                      className={
                        targetUser.is_active
                          ? "admin-user-status active"
                          : "admin-user-status inactive"
                      }
                    >
                      {targetUser.is_active ? "ACTIVE" : "DEACTIVATED"}
                    </span>

                    {targetUser.is_staff && (
                      <span className="admin-user-role">
                        STAFF
                      </span>
                    )}
                  </div>
                </div>

                <div className="admin-user-actions">
                  {targetUser.id === user.id ? (
                    <span className="admin-user-self-label">
                      YOUR ACCOUNT
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="admin-user-toggle-button"
                        onClick={() =>
                          handleToggleStatus(targetUser)
                        }
                        disabled={
                          actionUserId === targetUser.id ||
                          targetUser.is_staff
                        }
                        title={
                          targetUser.is_staff
                            ? "Staff account status cannot be changed here."
                            : ""
                        }
                      >
                        {actionUserId === targetUser.id
                          ? "PLEASE WAIT..."
                          : targetUser.is_active
                            ? "DEACTIVATE"
                            : "REACTIVATE"}
                      </button>

                      <button
                        type="button"
                        className="admin-user-delete-button"
                        onClick={() =>
                          handleDeleteUser(targetUser)
                        }
                        disabled={
                          actionUserId === targetUser.id ||
                          targetUser.is_staff
                        }
                        title={
                          targetUser.is_staff
                            ? "Staff accounts cannot be deleted here."
                            : ""
                        }
                      >
                        DELETE
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminUsers;
