import axios from "axios";

// Same-origin: dev uses Vite proxy, production uses Netlify proxy (netlify.toml).
// No cross-origin = no CORS issues on mobile.
const baseURL = "/api"; // Force proxy usage for mobile fix

console.log("API Base URL:", baseURL); // Debug logging
//yeah 
export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 25000,
});

export const getApiBaseURL = () => baseURL;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await api.post("/api/auth/refresh/", {
          refresh,
        });

        localStorage.setItem("access", res.data.access);

        originalRequest.headers.Authorization =
          "Bearer " + res.data.access;

        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);