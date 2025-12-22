package com.pms.userservice.service;

import com.pms.userservice.dto.RegisterResponse;
import com.pms.userservice.dto.PublicUserNameResponse;
import com.pms.userservice.model.Role;

import java.util.List;

public interface UserService {
    // RegisterResponse register(RegisterRequest request);
    // LoginResponse login(LoginRequest request);
    List<RegisterResponse> getAllUsers();

    RegisterResponse getUserById(Long id);

    RegisterResponse updateUser(Long id, RegisterResponse request);

    void deleteUser(Long id);

    RegisterResponse approveUser(Long id);

    RegisterResponse disableUser(Long id);

    /**
     * Re-activates a disabled account (DISABLED -> ACTIVE).
     */
    RegisterResponse enableUser(Long id);

    RegisterResponse updateRole(Long id, Role role);

    /**
     * Returns safe display names for the given user IDs.
     * Intended for authenticated, non-admin UI needs (e.g., team member lists).
     */
    List<PublicUserNameResponse> getPublicUserNames(List<Long> ids);

    /**
     * Resolves a username to a user id.
     * Intended for leader/admin workflows like adding team members.
     */
    Long getUserIdByUsername(String username);

}
