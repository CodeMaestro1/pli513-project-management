package com.pms.userservice.service.impl;

import com.pms.userservice.dto.RegisterResponse;
import com.pms.userservice.exception.UserNotFoundException;
import com.pms.userservice.model.Role;
import com.pms.userservice.model.Status;
import com.pms.userservice.model.User;
import com.pms.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User pendingUser;
    private User activeUser;

    @BeforeEach
    void setUp() {
        // A user who has just registered and is awaiting approval
        pendingUser = User.builder()
                .id(1L)
                .username("pendingUser")
                .email("pending@example.com")
                .role(Role.MEMBER)
                .status(Status.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        // A user who is already approved and active
        activeUser = User.builder()
                .id(2L)
                .username("activeUser")
                .email("active@example.com")
                .role(Role.MEMBER)
                .status(Status.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // --- getUserById Tests ---

    @Test
    void testGetUserById_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(pendingUser));

        // Act
        RegisterResponse response = userService.getUserById(1L);

        // Assert
        assertNotNull(response);
        assertEquals("pendingUser", response.getUsername());
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void testGetUserById_Failure_UserNotFound() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        UserNotFoundException exception = assertThrows(UserNotFoundException.class, () ->
                userService.getUserById(99L));

        assertEquals("User not found with id: 99", exception.getMessage());
    }

    // --- getAllUsers Test ---

    @Test
    void testGetAllUsers_Success() {
        // Arrange
        when(userRepository.findAll()).thenReturn(List.of(pendingUser, activeUser));

        // Act
        List<RegisterResponse> users = userService.getAllUsers();

        // Assert
        assertNotNull(users);
        assertEquals(2, users.size());
        assertEquals("pendingUser", users.get(0).getUsername());
        assertEquals("activeUser", users.get(1).getUsername());
        verify(userRepository, times(1)).findAll();
    }

    // --- approveUser Tests ---

    @Test
    void testApproveUser_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(pendingUser));
        // Mock the save operation to return the user
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        RegisterResponse response = userService.approveUser(1L);

        // Assert
        assertNotNull(response);
        assertEquals(Status.ACTIVE, response.getStatus()); // Status is now ACTIVE
        verify(userRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).save(any(User.class)); // Verify save was called
    }

    @Test
    void testApproveUser_Failure_UserNotFound() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        /*Act & Assert */
        assertThrows(UserNotFoundException.class, () -> userService.approveUser(99L));
    }

    @Test
    void testApproveUser_Failure_AlreadyActive() {
        // Arrange
        when(userRepository.findById(2L)).thenReturn(Optional.of(activeUser));

        // Act & Assert
        IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
            userService.approveUser(2L));

        assertEquals("User cannot be approved. Current status: " + Status.ACTIVE, exception.getMessage());
        verify(userRepository, never()).save(any()); // Save should NOT be called
    }

    // --- disableUser Tests ---

    @Test
    void testDisableUser_Success() {
        // Arrange
        when(userRepository.findById(2L)).thenReturn(Optional.of(activeUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        RegisterResponse response = userService.disableUser(2L);

        // Assert
        assertNotNull(response);
        assertEquals(Status.DISABLED, response.getStatus()); // Status is now DISABLED
        verify(userRepository, times(1)).findById(2L);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testDisableUser_Failure_UserNotFound() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> userService.disableUser(99L));
    }

    @Test
    void testDisableUser_Failure_PendingUser() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(pendingUser));

        /* Act & Assert */
        IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
            userService.disableUser(1L));

        assertEquals("User cannot be disabled. Account is still PENDING approval.", exception.getMessage());
        verify(userRepository, never()).save(any()); // Save should NOT be called
    }
}