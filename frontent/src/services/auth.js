import { userApi } from './api';

export const authService = {
  async login(username, password) {
    try {
      const res = await userApi.post('/auth/login', { username, password });
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed';
      throw new Error(msg);
    }
  },
  async register(payload) {
    // payload: { username, password, email, firstName, lastName }
    const res = await userApi.post('/auth/register', payload);
    return res.data;
  },
  async me(token) {
    // token is applied via interceptor; keeping signature for flexibility
    const res = await userApi.get('/users/me');
    return res.data;
  },
};