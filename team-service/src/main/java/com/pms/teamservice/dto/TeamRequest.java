package com.pms.teamservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamRequest {
    private String name;
    private String description;
    private Long teamLeaderId;
}