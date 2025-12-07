package com.pms.userservice.service.impl;

import com.pms.userservice.dto.LoginRequest;
import com.pms.userservice.dto.LoginResponse;
import com.pms.userservice.dto.RegisterRequest;
import com.pms.userservice.dto.RegisterResponse;
import com.pms.userservice.exception.DuplicateResourceException;
import com.pms.userservice.exception.InvalidCredentialsException;
import com.pms.userservice.model.Role;
import com.pms.userservice.model.Status;
import com.pms.userservice.model.User;
import com.pms.userservice.repository.UserRepository;
import com.pms.userservice.security.JwtService;
import com.pms.userservice.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.BadCredentialsException;
import com.pms.userservice.exception.AccountNotActiveException;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationConfiguration authenticationConfiguration;

    @Override
    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Registration failed: Username already taken.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Registration failed: Email already in use.");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(Role.MEMBER)          // default role
                .status(Status.PENDING)     // admin must activate
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return RegisterResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName()) // <-- ADD THIS
                .lastName(user.getLastName())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        try {
            // 1. Let AuthenticationManager do the work
            // It will check the username, check the password,
            // AND check if the account is enabled.
            AuthenticationManager authManager = authenticationConfiguration.getAuthenticationManager();

            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (DisabledException e) {
            throw new AccountNotActiveException("Your account is pending approval or has been disabled.");
        } catch (BadCredentialsException e) {
            // This is caught when the password is wrong
            throw new InvalidCredentialsException("Invalid username or password");
        } catch (AuthenticationException e) {
            // Catch-all for other security errors
            throw new InvalidCredentialsException("Authentication failed");
        } catch (Exception e) {
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }

        // 2. If authentication was successful, fetch the user
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found after successful authentication")); // This should not happen

        // 3. Generate token
        String token = jwtService.generateToken(user);

        // 4. Build response
        return LoginResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .token(token)
                .build();
    }
}
