import axios from "axios";

export const api = axios.create({
  baseURL: "https://unique-enthusiasm-production.up.railway.app/",
  headers: {
    "Content-Type": "application/json",
  },
});

// attach JWT automatically on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access"); // ✅ changed
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
