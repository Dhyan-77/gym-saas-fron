import axios from "axios";

// Same-origin: dev uses Vite proxy, production uses Netlify proxy (netlify.toml).
// No cross-origin = no CORS issues on mobile.
const baseURL = "";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 25000,
});

export const getApiBaseURL = () => baseURL;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isNetworkError =
      !err.response &&
      (err.message === "Network Error" || err.code === "ERR_NETWORK");
    if (isNetworkError) {
      err.userMessage =
        "Cannot reach server. Check your internet connection and try again.";
    }
    return Promise.reject(err);
  }
);
