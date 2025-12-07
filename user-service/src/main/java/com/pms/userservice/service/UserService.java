package com.pms.userservice.service;

import com.pms.userservice.dto.RegisterResponse;
import com.pms.userservice.model.Role;

import java.util.List;

public interface UserService {
    //RegisterResponse register(RegisterRequest request);
    //LoginResponse login(LoginRequest request);
    List<RegisterResponse> getAllUsers();
    RegisterResponse getUserById(Long id);
    RegisterResponse updateUser(Long id, RegisterResponse request);
    void deleteUser(Long id);
    RegisterResponse approveUser(Long id);
    RegisterResponse disableUser(Long id);
    RegisterResponse updateRole(Long id, Role role);

}

