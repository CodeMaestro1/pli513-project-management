package com.pms.userservice.service.impl;

import com.pms.userservice.dto.RegisterResponse;
import com.pms.userservice.dto.PublicUserNameResponse;
import com.pms.userservice.exception.UserNotFoundException;
import com.pms.userservice.model.Role;
import com.pms.userservice.model.Status;
import com.pms.userservice.model.User;
import com.pms.userservice.repository.UserRepository;
import com.pms.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public List<RegisterResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toUserResponse)
                .toList();
    }

    @Override
    public RegisterResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        return toUserResponse(user);
    }

    @Override
    public RegisterResponse updateUser(Long id, RegisterResponse request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Update process failed because user " +
                        "not found with id: " + id));

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());

        userRepository.save(user);

        return toUserResponse(user);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public RegisterResponse approveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        // This is the critical business logic
        if (user.getStatus() != Status.PENDING) {
            throw new IllegalStateException("User cannot be approved. Current status: " + user.getStatus());
        }

        user.setStatus(Status.ACTIVE);
        User savedUser = userRepository.save(user);

        return toUserResponse(savedUser);
    }

    @Override
    @Transactional
    public RegisterResponse disableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        // Business logic: Don't disable an already disabled user
        if (user.getStatus() == Status.DISABLED) {
            throw new IllegalStateException("User is already disabled.");
        }

        // Business logic: Pending users are not active yet; use approve/remove instead.
        if (user.getStatus() == Status.PENDING) {
            throw new IllegalStateException("User cannot be disabled. Account is still PENDING approval.");
        }

        user.setStatus(Status.DISABLED);
        User savedUser = userRepository.save(user);

        return toUserResponse(savedUser);
    }

    @Override
    @Transactional
    public RegisterResponse enableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        if (user.getStatus() == Status.ACTIVE) {
            throw new IllegalStateException("User is already active.");
        }

        if (user.getStatus() == Status.PENDING) {
            throw new IllegalStateException("User cannot be activated. Account is still PENDING approval.");
        }

        // Only remaining state should be DISABLED
        user.setStatus(Status.ACTIVE);
        User savedUser = userRepository.save(user);
        return toUserResponse(savedUser);
    }

    @Override
    @Transactional
    public RegisterResponse updateRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        // Business logic: Don't do anything if the role is already set
        if (user.getRole() == role) {
            throw new IllegalStateException("User already has the role: " + role);
        }

        user.setRole(role);
        User savedUser = userRepository.save(user);

        return toUserResponse(savedUser);
    }

    @Override
    public List<PublicUserNameResponse> getPublicUserNames(List<Long> ids) {
        if (ids == null || ids.isEmpty())
            return List.of();

        // Fetch in bulk; repository returns in arbitrary order.
        List<User> users = userRepository.findAllById(ids);
        Map<Long, String> nameById = new HashMap<>();
        for (User u : users) {
            if (u == null || u.getId() == null)
                continue;
            String fullName = ((u.getFirstName() == null ? "" : u.getFirstName().trim()) + " "
                    + (u.getLastName() == null ? "" : u.getLastName().trim())).trim();
            String displayName = !fullName.isBlank() ? fullName
                    : (u.getUsername() != null ? u.getUsername() : "User #" + u.getId());
            nameById.put(u.getId(), displayName);
        }

        // Preserve request order for UI convenience.
        return ids.stream()
                .distinct()
                .map(id -> PublicUserNameResponse.builder()
                        .id(id)
                        .displayName(nameById.getOrDefault(id, "User #" + id))
                        .build())
                .toList();
    }

    @Override
    public Long getUserIdByUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }

        User user = userRepository.findByUsername(username.trim())
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
        return user.getId();
    }

    @Override
    public Long getUserIdByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        String normalized = email.trim();
        User user = userRepository.findByEmailIgnoreCase(normalized)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        return user.getId();
    }

    private RegisterResponse toUserResponse(User user) {
        return RegisterResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }

}
