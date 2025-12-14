import { taskApi } from './api';

export const taskService = {
  async listMyTasks() {
    const res = await taskApi.get('/tasks/my-tasks');
    return res.data;
  },
  async create(payload) {
    const res = await taskApi.post('/tasks', payload);
    return res.data;
  },
  async update(taskId, payload) {
    const res = await taskApi.put(`/tasks/${taskId}`, payload);
    return res.data;
  },
  async remove(taskId) {
    const res = await taskApi.delete(`/tasks/${taskId}`);
    return res.data;
  },
};
