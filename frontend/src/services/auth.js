import { userApi } from './api';

export const authService = {
  async login(username, password) {
    const res = await userApi.post('/auth/login', { username, password });
    // Expect { token, user? }
    return res.data;
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
