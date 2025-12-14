import { teamApi } from './api';

export const teamService = {
  async listMyTeams() {
    const res = await teamApi.get('/teams/my-teams');
    return res.data;
  },
  async create(payload) {
    const res = await teamApi.post('/teams', payload);
    return res.data;
  },
  async updateMembers(teamId, payload) {
    const res = await teamApi.put(`/teams/${teamId}/members`, payload);
    return res.data;
  },
};
