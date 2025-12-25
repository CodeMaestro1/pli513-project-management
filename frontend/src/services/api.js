import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export function normalizeApiError(err) {
  // Axios error shape: https://axios-http.com/docs/handling_errors
  const isAxios = !!err && typeof err === "object" && "isAxiosError" in err;

  // Timeout / aborted requests
  const code = typeof err?.code === "string" ? err.code : undefined;
  const isTimeout = code === "ECONNABORTED";
  if (isTimeout) {
    return { status: 0, code: "TIMEOUT", message: "Request timed out", isAxios, raw: err };
  }

  // Network errors (no response)
  const hasResponse = !!err?.response;
  if (!hasResponse) {
    const msg = typeof err?.message === "string" ? err.message : "Network error";
    return { status: 0, code: "NETWORK_ERROR", message: msg, isAxios, raw: err };
  }

  const status = typeof err.response?.status === "number" ? err.response.status : 0;
  const data = err.response?.data;

  // Prefer backend-provided code/message (we're standardizing on these)
  const backendCode = typeof data?.code === "string" ? data.code : undefined;
  const backendMessage =
    typeof data?.message === "string"
      ? data.message
      : typeof err.message === "string"
        ? err.message
        : "Request failed";

  return {
    status,
    code: backendCode ?? `HTTP_${status}`,
    message: backendMessage,
    isAxios,
    raw: err,
  };
}

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
      // Centralize error normalization. Keep the original error but attach a stable shape.
      const normalized = normalizeApiError(err);
      if (err && typeof err === "object") {
        err.normalized = normalized;
      }
      return Promise.reject(err);
    }
  );
  return api;
}

export const userApi = buildApi();
export const taskApi = buildApi();
export const teamApi = buildApi();