package com.pms.userservice.service.impl;

import com.pms.userservice.dto.RegisterResponse;
import com.pms.userservice.exception.UserNotFoundException;
import com.pms.userservice.model.Role;
import com.pms.userservice.model.Status;
import com.pms.userservice.model.User;
import com.pms.userservice.repository.UserRepository;
import com.pms.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

        // Business logic: You shouldn't disable a user who isn't even approved yet
        if (user.getStatus() == Status.PENDING) {
            throw new IllegalStateException("User cannot be disabled. Account is still PENDING approval.");
        }

        user.setStatus(Status.DISABLED);
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

    private RegisterResponse toUserResponse(User user) {
        return RegisterResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }


}
