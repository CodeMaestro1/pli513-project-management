package com.pms.teamservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class TeamResponse {
    private String id;
    private String name;
    private String description;
    private Instant createdAt;
    private Long teamLeaderId;
    private List<Long> memberIds;
}