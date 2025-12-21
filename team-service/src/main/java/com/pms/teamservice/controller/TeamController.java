package com.pms.teamservice.controller;

import com.pms.teamservice.dto.MemberUpdateRequest;
import com.pms.teamservice.dto.TeamRequest;
import com.pms.teamservice.dto.TeamResponse;
import com.pms.teamservice.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    /**
     * Creates a new team. This endpoint is only accessible by users with the ADMIN role.
     *
     * @param teamRequest The details of the team to create.
     * @return The newly created team.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeamResponse> createTeam(@RequestBody TeamRequest teamRequest) {
        TeamResponse newTeam = teamService.createTeam(teamRequest);
        return new ResponseEntity<>(newTeam, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TeamResponse>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    /**
     * Retrieves all teams that the currently authenticated user is a member of.
     * Accessible by any authenticated user (ADMIN, LEADER, MEMBER).
     */
    @GetMapping("/my-teams")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TeamResponse>> getMyTeams(Authentication authentication) {
        // Our principal is the Long userId, thanks to the filter update
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(teamService.getMyTeams(userId));
    }

    /**
     * Updates a team's info (name, description, leader).
     * Accessible only by ADMIN or the Team's Leader.
     */
    @PutMapping("/{teamId}")
    @PreAuthorize("hasRole('ADMIN') or @teamService.isTeamLeader(authentication, #teamId)")
    public ResponseEntity<TeamResponse> updateTeam(
            @PathVariable String teamId,
            @RequestBody TeamRequest teamRequest) {
        return ResponseEntity.ok(teamService.updateTeam(teamId, teamRequest));
    }

    /**
     * Adds a member to a team.
     * Accessible only by the Team's Leader. [cite: 117]
     */
    @PatchMapping("/{teamId}/add-member")
    @PreAuthorize("@teamService.isTeamLeader(authentication, #teamId)")
    public ResponseEntity<TeamResponse> addMember(
            @PathVariable String teamId,
            @RequestBody MemberUpdateRequest request) {
        return ResponseEntity.ok(teamService.addMemberToTeam(teamId, request.getUserId()));
    }

    /**
     * Deletes a team by its ID.
     * Accessible only by users with the ADMIN role.
     * @param teamId The ID of the team to delete.
     */
    @DeleteMapping("/{teamId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTeam(@PathVariable String teamId) {
        teamService.deleteTeam(teamId);
        return ResponseEntity.noContent().build(); // Returns 204 No Content
    }

    /**
     * Removes a member from a team.
     * Accessible only by the Team's Leader.
     */
    @PatchMapping("/{teamId}/remove-member")
    @PreAuthorize("@teamService.isTeamLeader(authentication, #teamId)")
    public ResponseEntity<TeamResponse> removeMember(
            @PathVariable String teamId,
            @RequestBody MemberUpdateRequest request) {
        return ResponseEntity.ok(teamService.removeMemberFromTeam(teamId, request.getUserId()));
    }
}