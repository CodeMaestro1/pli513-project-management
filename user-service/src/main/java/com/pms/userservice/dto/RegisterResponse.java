package com.pms.userservice.dto;

import com.pms.userservice.model.Role;
import com.pms.userservice.model.Status;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegisterResponse {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private Status status;
}
