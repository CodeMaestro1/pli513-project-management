package com.pms.userservice.controller;

import com.pms.userservice.dto.*;
import com.pms.userservice.service.AuthenticationService;
import com.pms.userservice.security.JwtService; // <-- Make sure this is imported
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    //private final UserService userService;
    private final AuthenticationService authService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verifyToken(@RequestBody VerifyTokenRequest request) {
        // This now returns true/false safely
        boolean isValid = jwtService.isTokenValid(request.getToken());
        return ResponseEntity.ok(isValid);
    }
}
