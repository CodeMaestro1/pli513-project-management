import axios from "axios";

// Use empty base URL so request paths are absolute.
// Previously "/api" caused URLs like "/api/api/v1/...".
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export const userApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});