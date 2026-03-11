import { api } from "./api";

export const checkAuth = async () => {
  const access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  if (!access && !refresh) return false;

  try {
    await api.get("/api/auth/me/again/");
    return true;
  } catch {
    return false;
  }
};