import { teamApi } from './api';

export const teamService = {
  async listMyTeams() {
    const res = await teamApi.get('/api/v1/teams/my-teams');
    return res.data;
  },
  async create(payload) {
    const res = await teamApi.post('/api/v1/teams', payload);
    return res.data;
  },
  async updateMembers(teamId, payload) {
    // Backward-compatible wrapper. Backend exposes PATCH add-member/remove-member.
    // Expected payload shape examples:
    // - { action: 'add', userId: 123 }
    // - { action: 'remove', userId: 123 }
    const action = payload?.action;
    const userId = payload?.userId;
    if (!teamId || !action || userId == null) throw new Error('updateMembers requires { action, userId }');

    if (action === 'add') {
      const res = await teamApi.patch(`/api/v1/teams/${teamId}/add-member`, { userId });
      return res.data;
    }
    if (action === 'remove') {
      const res = await teamApi.patch(`/api/v1/teams/${teamId}/remove-member`, { userId });
      return res.data;
    }

    throw new Error("updateMembers action must be 'add' or 'remove'");
  },
};