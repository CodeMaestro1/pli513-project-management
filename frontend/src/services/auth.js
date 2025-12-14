import { userApi } from "./api";

export const authService = {
  async login(username, password) {
    const res = await userApi.post("/api/v1/auth/login", { username, password });
    return res.data;
  },
  async register(payload) {
    const res = await userApi.post("/api/v1/auth/register", payload);
    return res.data;
  },
  async me() {
    const res = await userApi.get("/api/v1/users/me");
    return res.data;
  },
};