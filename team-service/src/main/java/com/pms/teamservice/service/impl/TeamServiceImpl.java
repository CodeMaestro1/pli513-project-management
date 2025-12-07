package com.pms.teamservice.service.impl;

import com.pms.teamservice.dto.TeamRequest;
import com.pms.teamservice.dto.TeamResponse;
import com.pms.teamservice.exception.ResourceNotFoundException;
import com.pms.teamservice.model.Team;
import com.pms.teamservice.repository.TeamRepository;
import com.pms.teamservice.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service("teamService")
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;


    @Override
    public TeamResponse createTeam(TeamRequest teamRequest) {
        Team team = Team.builder()
                .name(teamRequest.getName())
                .description(teamRequest.getDescription())
                .teamLeaderId(teamRequest.getTeamLeaderId())
                .memberIds(new ArrayList<>()) // Start with an empty member list
                .createdAt(Instant.now())
                .build();

        // Add the leader to the member list
        if (teamRequest.getTeamLeaderId() != null) {
            team.getMemberIds().add(teamRequest.getTeamLeaderId());
        }

        Team savedTeam = teamRepository.save(team);
        return mapToTeamResponse(savedTeam);
    }

    @Override
    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll()
                .stream()
                .map(this::mapToTeamResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TeamResponse> getMyTeams(Long userId) {
        // Use our new custom repository method
        return teamRepository.findByMemberIdsContaining(userId)
                .stream()
                .map(this::mapToTeamResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TeamResponse updateTeam(String teamId, TeamRequest teamRequest) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        // Update fields
        team.setName(teamRequest.getName());
        team.setDescription(teamRequest.getDescription());

        // Check if the leader changed and update member list
        Long oldLeaderId = team.getTeamLeaderId();
        Long newLeaderId = teamRequest.getTeamLeaderId();

        if (newLeaderId != null && !newLeaderId.equals(oldLeaderId)) {
            // Remove old leader from members if they exist
            if (oldLeaderId != null) {
                team.getMemberIds().remove(oldLeaderId);
            }
            // Add new leader if not already a member
            if (!team.getMemberIds().contains(newLeaderId)) {
                team.getMemberIds().add(newLeaderId);
            }
            team.setTeamLeaderId(newLeaderId);
        }

        Team updatedTeam = teamRepository.save(team);
        return mapToTeamResponse(updatedTeam);
    }

    @Override
    public TeamResponse addMemberToTeam(String teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        // Check if user is already a member
        if (team.getMemberIds().contains(userId)) {
            throw new IllegalStateException("User is already a member of this team.");
        }

        team.getMemberIds().add(userId);
        Team updatedTeam = teamRepository.save(team);
        return mapToTeamResponse(updatedTeam);
    }

    @Override
    public TeamResponse removeMemberFromTeam(String teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        // Security check: cannot remove the team leader
        if (Objects.equals(team.getTeamLeaderId(), userId)) {
            throw new IllegalStateException("Cannot remove the team leader. Change the leader first.");
        }

        if (team.getMemberIds() == null || !team.getMemberIds().contains(userId)) {
            throw new ResourceNotFoundException("User is not a member of this team.");
        }

        team.getMemberIds().remove(userId);
        Team updatedTeam = teamRepository.save(team);
        return mapToTeamResponse(updatedTeam);
    }

    @Override
    public void deleteTeam(String teamId) {
        // First, check if the team exists
        if (!teamRepository.existsById(teamId)) {
            throw new ResourceNotFoundException("Team not found with id: " + teamId);
        }

        // Delete the team
        teamRepository.deleteById(teamId);
    }

    @Override
    public boolean isTeamLeader(Authentication authentication, String teamId) {
        // Get the authenticated user's ID (which we stored as the principal)
        Long currentUserId = (Long) authentication.getPrincipal();

        // Find the team
        Team team = teamRepository.findById(teamId).orElse(null);

        // Check if the user is the leader
        return team != null && Objects.equals(team.getTeamLeaderId(), currentUserId);
    }



    // Helper method to map Entity to DTO
    private TeamResponse mapToTeamResponse(Team team) {
        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .createdAt(team.getCreatedAt())
                .teamLeaderId(team.getTeamLeaderId())
                .memberIds(team.getMemberIds())
                .build();
    }
}