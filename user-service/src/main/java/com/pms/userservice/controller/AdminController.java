package com.pms.userservice.controller;

import com.pms.userservice.dto.RegisterResponse;
import com.pms.userservice.model.Role;
import com.pms.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<RegisterResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegisterResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Note: You may want a specific UpdateUserRequest DTO here
    // instead of reusing RegisterResponse, but this works for now.
    @PutMapping("/{id}")
    public ResponseEntity<RegisterResponse> updateUser(
            @PathVariable Long id,
            @RequestBody RegisterResponse request
    ) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * NEW: Approves a user's registration.
     * This endpoint is for changing a user's status from PENDING to ACTIVE.
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<RegisterResponse> approveUser(@PathVariable Long id) {
        RegisterResponse updatedUser = userService.approveUser(id);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * NEW: Disables a user's account.
     * This endpoint is for changing a user's status to DISABLED.
     */
    @PatchMapping("/{id}/disable")
    public ResponseEntity<RegisterResponse> disableUser(@PathVariable Long id) {
        RegisterResponse updatedUser = userService.disableUser(id);
        return ResponseEntity.ok(updatedUser);
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<RegisterResponse> updateRole(
            @PathVariable Long id,
            @RequestParam Role role
    ) {
        return ResponseEntity.ok(userService.updateRole(id, role));
    }
}