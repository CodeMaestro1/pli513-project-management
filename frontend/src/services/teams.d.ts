declare module "@/services/teams" {
  export interface TeamApiResponse {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    teamLeaderId: number;
    memberIds: number[];
  }

  export interface CreateTeamPayload {
    name: string;
    description: string;
    teamLeaderId: number;
  }

  export interface UpdateTeamPayload {
    name: string;
    description: string;
    teamLeaderId: number;
  }

  export declare const teamService: {
    listAllTeams(): Promise<TeamApiResponse[]>;
    listMyTeams(): Promise<TeamApiResponse[]>;
    create(payload: CreateTeamPayload): Promise<TeamApiResponse>;
    updateTeam(teamId: string, payload: UpdateTeamPayload): Promise<TeamApiResponse>;
    remove(teamId: string): Promise<void>;
    updateMembers(teamId: string, payload: { action: "add" | "remove"; userId: number }): Promise<TeamApiResponse>;
  };
}
