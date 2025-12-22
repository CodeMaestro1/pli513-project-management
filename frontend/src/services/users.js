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
};
