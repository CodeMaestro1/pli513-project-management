package com.pms.userservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicUserNameResponse {
    private Long id;
    private String displayName;
}
