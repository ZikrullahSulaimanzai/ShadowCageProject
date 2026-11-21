
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api/";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Remove JSON Content-Type for FormData.
  // The browser/Axios will automatically set multipart/form-data
  // with the required boundary.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (config.data && typeof config.data === "object") {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

let refreshRequest = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("auth/token/")
    ) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem("refresh_token");

    if (!refresh) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = axios
          .post(`${API_BASE}auth/token/refresh/`, { refresh })
          .then((response) => {
            localStorage.setItem("access_token", response.data.access);
            return response.data.access;
          })
          .catch((refreshError) => {
            const status = refreshError.response?.status;

            // Clear the session only when the refresh token is rejected.
            if (status === 400 || status === 401) {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");

              window.dispatchEvent(new Event("auth:session-expired"));
            }

            throw refreshError;
          })
          .finally(() => {
            refreshRequest = null;
          });
      }

      const newAccessToken = await refreshRequest;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default api;
