package com.pms.userservice.service.impl;

import com.pms.userservice.dto.LoginRequest;
import com.pms.userservice.dto.LoginResponse;
import com.pms.userservice.dto.RegisterRequest;
import com.pms.userservice.dto.RegisterResponse;
import com.pms.userservice.model.Role;
import com.pms.userservice.model.Status;
import com.pms.userservice.model.User;
import com.pms.userservice.repository.UserRepository;
import com.pms.userservice.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.LocalDateTime;
import java.util.Optional;

// Import static methods for assertions and mocking
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // This tells JUnit 5 to use Mockito
class AuthenticationServiceImplTest {

    // --- Mocks ---
    // Create a mock for each dependency the service needs
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    // --- Class Under Test ---
    // Inject the mocks we created above into this instance
    @InjectMocks
    private AuthenticationServiceImpl authService;

    // We'll use these dummy objects in our tests
    private RegisterRequest registerRequest;
    private User savedUser;

    @BeforeEach
    void setUp() {
        // This runs before each test, setting up our test data
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("tester");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirstName("Test");
        registerRequest.setLastName("User");

        savedUser = User.builder()
                .id(1L)
                .username("tester")
                .email("test@example.com")
                .password("encodedPassword") // The "hashed" password
                .role(Role.MEMBER)
                .status(Status.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testRegister_Success() {
        // --- Arrange (Set up the mocks) ---

        // 1. When passwordEncoder.encode() is called with ANY string,
        //    then return "encodedPassword".
        when(passwordEncoder.encode(any(String.class))).thenReturn("encodedPassword");

        // 2. When userRepository.save() is called with ANY User object,
        //    then return our 'savedUser'.
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // --- Act (Call the method) ---
        RegisterResponse response = authService.register(registerRequest);

        // --- Assert (Check the results) ---
        assertNotNull(response); // The response shouldn't be null
        assertEquals("tester", response.getUsername()); // Check username
        assertEquals(Role.MEMBER, response.getRole()); // Check default role
        assertEquals(Status.PENDING, response.getStatus()); // Check default status

        // --- Verify (Check that mocks were called) ---

        // 1. Verify passwordEncoder.encode() was called exactly 1 time
        //    with the password from our request.
        verify(passwordEncoder, times(1)).encode("password123");

        // 2. Verify userRepository.save() was called exactly 1 time.
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testLogin_Success() {
        // --- Arrange ---
        LoginRequest loginRequest = new LoginRequest("tester", "password123");
        String dummyToken = "dummy.jwt.token";

        // 1. When userRepository.findByUsername() is called with "tester",
        //    then return an Optional containing our 'savedUser'.
        when(userRepository.findByUsername("tester")).thenReturn(Optional.of(savedUser));

        // 2. When jwtService.generateToken() is called with our user,
        //    then return our 'dummyToken'.
        when(jwtService.generateToken(savedUser)).thenReturn(dummyToken);

        // Note: We don't need to mock authenticationManager.authenticate()
        // for a successful test, as it returns void.

        // --- Act ---
        LoginResponse response = authService.login(loginRequest);

        // --- Assert ---
        assertNotNull(response);
        assertEquals("tester", response.getUsername());
        assertEquals(dummyToken, response.getToken()); // Check the token

        // --- Verify ---

        // 1. Verify AuthenticationManager.authenticate() was called 1 time.
        verify(authenticationManager, times(1)).authenticate(any());

        // 2. Verify jwtService.generateToken() was called 1 time.
        verify(jwtService, times(1)).generateToken(savedUser);
    }

    @Test
    void testLogin_Failure_InvalidCredentials() {
        // --- Arrange ---
        LoginRequest loginRequest = new LoginRequest("tester", "wrongpassword");

        // 1. Configure the AuthenticationManager mock:
        //    When .authenticate() is called with any credentials,
        //    throw a BadCredentialsException (a type of AuthenticationException).
        //    This simulates Spring Security rejecting the login.
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Invalid credentials"));
        //Maybe use it on the main application??

        // --- Act & Assert ---
        // 1. We assert that calling authService.login()
        //    throws the RuntimeException we defined in our service.
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            authService.login(loginRequest));

        // 2. (Optional) Check the exception message
        assertEquals("Invalid username or password", exception.getMessage());

        // --- Verify ---
        // 1. Verify AuthenticationManager.authenticate() was called.
        verify(authenticationManager, times(1)).authenticate(any());

        // 2. CRITICAL: Verify that the JWT service was NEVER called.
        //    No token should be generated for a failed login.
        verify(jwtService, never()).generateToken(any());

        // 3. Verify the repository was not called to find the user
        //    (since authentication failed first).
        verify(userRepository, never()).findByUsername(any());
    }
}