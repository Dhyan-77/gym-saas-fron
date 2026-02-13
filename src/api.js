import axios from "axios";

export const api = axios.create({
  baseURL: "https://gym-saas-1.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// attach JWT automatically on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
