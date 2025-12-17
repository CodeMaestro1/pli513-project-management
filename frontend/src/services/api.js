import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

function buildApi(){
  const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
  });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  api.interceptors.response.use(
    (res) => res,
    (err) => {
      // centralize error normalization/logging
      return Promise.reject(err);
    }
  );
  return api;
}

export const userApi = buildApi();
export const taskApi = buildApi();
export const teamApi = buildApi();