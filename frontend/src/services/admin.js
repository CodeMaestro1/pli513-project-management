import { userApi } from './api';

export const adminService = {
  async listPendingUsers() {
    const res = await userApi.get('/admin/users/pending');
    return res.data;
  },
  async approveUser(userId) {
    const res = await userApi.post(`/admin/users/${userId}/approve`);
    return res.data;
  },
  async deleteUser(userId) {
    const res = await userApi.delete(`/admin/users/${userId}`);
    return res.data;
  },
};
