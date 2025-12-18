package com.pms.userservice.config;

import com.pms.userservice.model.Role;
import com.pms.userservice.model.Status;
import com.pms.userservice.model.User;
import com.pms.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Check if the admin user already exists to avoid duplicates
        if (!userRepository.existsByUsername("admin")) {

            User admin = User.builder()
                    .username("admin")
                    .email("admin@pms.com") // Dummy email
                    .password(passwordEncoder.encode("admin123")) // Hash the password!
                    .firstName("System")
                    .lastName("Administrator")
                    .role(Role.ADMIN) // The crucial ADMIN role
                    .status(Status.ACTIVE) // The crucial ACTIVE status
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(admin);

            System.out.println("---------------------------------");
            System.out.println(" ADMIN ACCOUNT CREATED");
            System.out.println(" Username: admin");
            System.out.println(" Password: admin123");
            System.out.println("---------------------------------");
        }

        if (!userRepository.existsByUsername("testUser")){
            User admin = User.builder()
                    .username("testUser")
                    .email("test@pms.com") // Dummy email
                    .password(passwordEncoder.encode("test123")) // Hash the password!
                    .firstName("Test")
                    .lastName("User")
                    .role(Role.MEMBER) // The crucial ADMIN role
                    .status(Status.ACTIVE) // The crucial ACTIVE status
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(admin);

            System.out.println("---------------------------------");
            System.out.println(" Test User ACCOUNT CREATED");
            System.out.println(" Username: testUser");
            System.out.println(" Password: test123");
            System.out.println("---------------------------------");
        }
        }
    }
