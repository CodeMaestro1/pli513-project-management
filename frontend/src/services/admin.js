import { userApi } from './api';

export const adminService = {
  async listUsers() {
    const res = await userApi.get('/api/v1/admin/users');
    return res.data;
  },
  async approveUser(userId) {
    const res = await userApi.patch(`/api/v1/admin/users/${userId}/approve`);
    return res.data;
  },
  async disableUser(userId) {
    const res = await userApi.patch(`/api/v1/admin/users/${userId}/disable`);
    return res.data;
  },
  async updateRole(userId, role) {
    const res = await userApi.patch(`/api/v1/admin/users/${userId}/role`, null, { params: { role } });
    return res.data;
  },
  async deleteUser(userId) {
    await userApi.delete(`/api/v1/admin/users/${userId}`);
  },
};