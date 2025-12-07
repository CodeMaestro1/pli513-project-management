package com.pms.userservice.dto;

import com.pms.userservice.model.Role;
import com.pms.userservice.model.Status;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class LoginResponse {
    private String token;
    private Long id;
    private String username;
    private String email;
    private Role role;
    private Status status;
}
