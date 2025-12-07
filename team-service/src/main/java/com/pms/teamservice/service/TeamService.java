package com.pms.teamservice.service;

import com.pms.teamservice.dto.TeamRequest;
import com.pms.teamservice.dto.TeamResponse;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface TeamService {
    TeamResponse createTeam(TeamRequest teamRequest);

    List<TeamResponse> getAllTeams();
    List<TeamResponse> getMyTeams(Long userId);

    /**
     * Updates a team's basic information (name, description, leader).
     */
    TeamResponse updateTeam(String teamId, TeamRequest teamRequest);

    /**
     * Adds a new member to a team.
     */
    TeamResponse addMemberToTeam(String teamId, Long userId);

    /**
     * Removes a member from a team.
     */
    TeamResponse removeMemberFromTeam(String teamId, Long userId);

    /**
     * Deletes a team from the system.
     * @param teamId The ID of the team to delete.
     */
    void deleteTeam(String teamId);

    /**
     * Security check: Verifies if the authenticated user is the leader of the specified team.
     * This method is public so it can be called from @PreAuthorize annotations.
     * @param authentication The user's authentication context
     * @param teamId The ID of the team to check
     * @return true if the user is the team leader, false otherwise
     */
    boolean isTeamLeader(Authentication authentication, String teamId);
}