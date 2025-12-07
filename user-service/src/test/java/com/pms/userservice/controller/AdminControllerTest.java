package com.pms.userservice.controller;

import com.pms.userservice.model.Role;
import com.pms.userservice.model.Status;
import com.pms.userservice.model.User;
import com.pms.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest // Loads the full Spring context
@AutoConfigureMockMvc // Gives us MockMvc to make requests
@Transactional // Rolls back all database changes after each test
@ActiveProfiles("test")
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository; // Inject the real repository

    private User pendingUser;

    @BeforeEach
    void setUp() {
        // Clear the repository to ensure a clean state
        userRepository.deleteAll();

        // Create and save a PENDING user directly to the DB for our tests
        pendingUser = User.builder()
                .username("test-pending")
                .email("testpending@example.com")
                .password("hashed-password") // In a real test, this would be encoded
                .role(Role.MEMBER)
                .status(Status.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        // We must save the user to get a real ID from the database
        pendingUser = userRepository.save(pendingUser);
    }

    // --- TEST 1: Success as Admin ---
    @Test
    @WithMockUser(roles = "ADMIN") // Simulates a logged-in user with the ADMIN role
    void testApproveUser_AsAdmin_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(patch("/api/v1/admin/users/" + pendingUser.getId() + "/approve"))
                .andExpect(status().isOk()) // Expect 200 OK
                .andExpect(jsonPath("$.status", is(Status.ACTIVE.name()))) // Check the response JSON
                .andExpect(jsonPath("$.username", is("test-pending")));

        // (Optional) Verify the change in the database
        User updatedUser = userRepository.findById(pendingUser.getId()).orElseThrow();
        assertEquals(Status.ACTIVE, updatedUser.getStatus());
    }

    // --- TEST 2: Security check as MEMBER ---
    @Test
    @WithMockUser(roles = "MEMBER") // Simulates a logged-in user with the MEMBER role
    void testApproveUser_AsMember_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(patch("/api/v1/admin/users/" + pendingUser.getId() + "/approve"))
                .andExpect(status().isForbidden()); // Expect 403 Forbidden
    }

    // --- TEST 3: Security check as ANONYMOUS ---
    @Test
    void testApproveUser_AsAnonymous_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(patch("/api/v1/admin/users/" + pendingUser.getId() + "/approve"))
                .andExpect(status().isForbidden()); // Expect 403 Forbidden
    }

    // --- TEST 4: Get All Users as Admin ---
    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllUsers_AsAdmin_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()", is(1))) // Check that our one user is in the list
                .andExpect(jsonPath("$[0].username", is("test-pending")));
    }
}