package com.pms.userservice.controller;

import com.pms.userservice.dto.RegisterResponse;
import com.pms.userservice.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for authenticated users to manage their own profile.
 */
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    /**
     * Retrieves the profile information of the currently authenticated user.
     *
     * @param authentication The Spring Security Authentication object (injected automatically).
     * @return A DTO with the user's information.
     */
    @GetMapping("/me")
    public ResponseEntity<RegisterResponse> getMyProfile(Authentication authentication) {
        // 1. Get the authenticated User object from the security context
        // This cast works because we set our custom User object in the JwtAuthenticationFilter
        User currentUser = (User) authentication.getPrincipal();

        // 2. Map the User entity to our response DTO
        RegisterResponse profile = RegisterResponse.builder()
                .id(currentUser.getId())
                .username(currentUser.getUsername())
                .email(currentUser.getEmail())
                .firstName(currentUser.getFirstName())
                .lastName(currentUser.getLastName())
                .role(currentUser.getRole())
                .status(currentUser.getStatus())
                .build();

        return ResponseEntity.ok(profile);
    }
}