import { userApi } from './api';

export const userService = {
  /**
   * Resolve user IDs to safe display names.
   * Backend: POST /api/v1/users/public-names
   */
  async getPublicNames(ids) {
    const safeIds = Array.isArray(ids) ? ids.filter((x) => x != null) : [];
    if (safeIds.length === 0) return [];
    const res = await userApi.post('/api/v1/users/public-names', { ids: safeIds });
    return res.data;
  },

  /**
   * Resolve a username to a user id.
   * Backend: GET /api/v1/users/resolve-id?username=...
   */
  async resolveUserId(username) {
    const u = typeof username === 'string' ? username.trim() : '';
    if (!u) throw new Error('resolveUserId requires username');
    const res = await userApi.get('/api/v1/users/resolve-id', { params: { username: u } });
    return res.data;
  },

  /**
   * Resolve an email to a user id.
   * Backend: GET /api/v1/users/resolve-id?email=...
   */
  async resolveUserIdByEmail(email) {
    const e = typeof email === 'string' ? email.trim() : '';
    if (!e) throw new Error('resolveUserIdByEmail requires email');
    const res = await userApi.get('/api/v1/users/resolve-id', { params: { email: e } });
    return res.data;
  },
};
