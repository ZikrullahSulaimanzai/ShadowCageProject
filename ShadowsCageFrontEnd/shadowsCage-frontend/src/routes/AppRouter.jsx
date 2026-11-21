
import { Routes, Route } from "react-router-dom";

import AdminUsers from "../pages/AdminUsers";
import AdminDashboard from "../pages/AdminDashboard";
import CreatePost from "../pages/CreatePost";
import EditPost from "../pages/EditPost";

import ChangePassword from "../pages/ChangePassword";
import EditProfile from "../pages/EditProfile";
import Profile from "../pages/Profile";

import Welcome from "../pages/Welcome";
import Home from "../pages/Home";
import PostDetail from "../pages/PostDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Profile - authenticated users */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Posts - authenticated users */}
      <Route
        path="/posts"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/posts/:id"
        element={
          <ProtectedRoute>
            <PostDetail />
          </ProtectedRoute>
        }
      />

      {/* Support singular post URLs */}
      <Route
        path="/post/:id"
        element={
          <ProtectedRoute>
            <PostDetail />
          </ProtectedRoute>
        }
      />

      {/* Admin-only pages */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/posts/new"
        element={
          <ProtectedRoute requireAdmin>
            <CreatePost />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/posts/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <EditPost />
          </ProtectedRoute>
        }
      />

      {/* Unknown URLs */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
