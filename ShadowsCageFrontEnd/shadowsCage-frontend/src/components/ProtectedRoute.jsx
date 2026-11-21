
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Wait until authentication is checked.
  if (loading) {
    return <p className="auth-loading">Checking your session...</p>;
  }

  // Redirect guests to login.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Block normal users from admin-only pages.
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/posts" replace />;
  }

  return children;
}
