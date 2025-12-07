package com.pms.userservice.service;

import com.pms.userservice.dto.LoginRequest;
import com.pms.userservice.dto.LoginResponse;
import com.pms.userservice.dto.RegisterRequest;
import com.pms.userservice.dto.RegisterResponse;


public interface AuthenticationService {

    /**
     * Registers a new user in the system.
     * @param request DTO containing registration details.
     * @return DTO containing the newly created user's details.
     */
    RegisterResponse register(RegisterRequest request);

    /**
     * Authenticates a user and returns a JWT.
     * @param request DTO containing login credentials.
     * @return DTO containing user details and the JWT.
     */
    LoginResponse login(LoginRequest request);
}