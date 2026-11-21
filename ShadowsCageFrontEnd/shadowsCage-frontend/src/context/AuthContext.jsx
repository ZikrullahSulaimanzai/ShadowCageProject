
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the current user's session.
  const loadCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("auth/me/");
      setUser(response.data);
    } catch (error) {
      console.error("Could not restore user session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check the session when the application starts.
  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  // Listen for expired or rejected refresh tokens.
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setLoading(false);
    };

    window.addEventListener(
      "auth:session-expired",
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        "auth:session-expired",
        handleSessionExpired
      );
    };
  }, []);

  // Log in.
  async function login(username, password) {
    const response = await api.post("auth/token/", {
      username,
      password,
    });

    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);

    try {
      const userResponse = await api.get("auth/me/");
      setUser(userResponse.data);

      return userResponse.data;
    } catch (error) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);

      throw error;
    }
  }

  // Register a new account and log in.
  async function register({
    username,
    email,
    password,
    password_confirm,
  }) {
    await api.post("auth/register/", {
      username,
      email,
      password,
      password_confirm,
    });

    return login(username, password);
  }

  // Log out.
  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: Boolean(user?.is_staff),
        login,
        register,
        logout,
        refreshUser: loadCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
