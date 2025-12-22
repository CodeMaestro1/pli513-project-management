package com.pms.userservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResolveUserIdResponse {
    private Long id;
}
