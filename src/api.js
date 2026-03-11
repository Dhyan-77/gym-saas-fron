import axios from "axios";

// Same-origin proxy
const baseURL = "";

console.log("API Base URL:", baseURL);

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 25000,
});

export const getApiBaseURL = () => baseURL;


// ----------------------------
// Attach Access Token
// ----------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// ----------------------------
// Auto Refresh Token
// ----------------------------
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          "/api/auth/refresh/",
          { refresh }
        );

        const newAccess = response.data.access;

        localStorage.setItem("access", newAccess);

        // update header
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccess}`;

        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${newAccess}`;

        return api(originalRequest);

      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);