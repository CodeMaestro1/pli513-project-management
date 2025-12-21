declare module "@/services/teams" {
  import type { Team } from "@/types/team";

  export interface CreateTeamPayload {
    name: string;
    description: string;
    leader: string;
    memberIds: string[];
  }

  export declare const teamService: {
    listMyTeams(): Promise<Team[]>;
    create(payload: CreateTeamPayload): Promise<Team>;
    updateMembers(teamId: string, payload: { action: "add" | "remove"; userId: number }): Promise<Team>;
  };
}
