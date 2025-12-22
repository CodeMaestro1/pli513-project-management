package com.pms.userservice.controller;

import com.pms.userservice.dto.PublicNamesRequest;
import com.pms.userservice.dto.PublicUserNameResponse;
import com.pms.userservice.dto.RegisterResponse;
import com.pms.userservice.model.User;
import com.pms.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller for authenticated users to manage their own profile.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private static final int PUBLIC_NAMES_MAX_IDS = 100;

    private final UserService userService;

    /**
     * Retrieves the profile information of the currently authenticated user.
     *
     * @param authentication The Spring Security Authentication object (injected
     *                       automatically).
     * @return A DTO with the user's information.
     */
    @GetMapping("/me")
    public ResponseEntity<RegisterResponse> getMyProfile(Authentication authentication) {
        // 1. Get the authenticated User object from the security context
        // This cast works because we set our custom User object in the
        // JwtAuthenticationFilter
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
                .createdAt(currentUser.getCreatedAt())
                .build();

        return ResponseEntity.ok(profile);
    }

    /**
     * Returns safe display names (no email/role/status) for the provided user IDs.
     * This endpoint is authenticated by default (see SecurityConfig).
     */
    @PostMapping("/public-names")
    public ResponseEntity<List<PublicUserNameResponse>> getPublicNames(@RequestBody PublicNamesRequest request) {
        List<Long> ids = request == null ? null : request.getIds();
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        if (ids.size() > PUBLIC_NAMES_MAX_IDS) {
            return ResponseEntity.badRequest().body(List.of());
        }
        return ResponseEntity.ok(userService.getPublicUserNames(ids));
    }
}