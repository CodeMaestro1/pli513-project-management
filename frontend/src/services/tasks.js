import { taskApi } from './api';

export const taskService = {
  async listAllTasks() {
    const res = await taskApi.get('/api/v1/tasks');
    return res.data;
  },
  async listMyTasks() {
    const res = await taskApi.get('/api/v1/tasks/my-tasks');
    return res.data;
  },
  async listByTeam(teamId) {
    if (!teamId) throw new Error('listByTeam requires teamId');
    const res = await taskApi.get(`/api/v1/tasks/team/${teamId}`);
    return res.data;
  },
  async create(payload) {
    const res = await taskApi.post('/api/v1/tasks', payload);
    return res.data;
  },
  async update(taskId, payload) {
    const res = await taskApi.put(`/api/v1/tasks/${taskId}`, payload);
    return res.data;
  },
  async updateStatus(taskId, status) {
    const res = await taskApi.patch(`/api/v1/tasks/${taskId}/status`, null, { params: { status } });
    return res.data;
  },
  async remove(taskId) {
    const res = await taskApi.delete(`/api/v1/tasks/${taskId}`);
    return res.data;
  },

  async listComments(taskId) {
    if (!taskId) throw new Error('listComments requires taskId');
    const res = await taskApi.get(`/api/v1/tasks/${taskId}/comments`);
    return res.data;
  },

  async addComment(taskId, payload) {
    if (!taskId) throw new Error('addComment requires taskId');
    const res = await taskApi.post(`/api/v1/tasks/${taskId}/comments`, payload);
    return res.data;
  },
};