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
                    .role(Role.ADMIN)
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

        if (!userRepository.existsByUsername("testUser")) {
            User testUser = User.builder()
                    .username("testUser")
                    .email("test@pms.com") // Dummy email
                    .password(passwordEncoder.encode("test123")) // Hash the password!
                    .firstName("Test")
                    .lastName("User")
                    .role(Role.MEMBER)
                    .status(Status.ACTIVE) // The crucial ACTIVE status
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(testUser);

            System.out.println("---------------------------------");
            System.out.println(" Test User ACCOUNT CREATED");
            System.out.println(" Username: testUser");
            System.out.println(" Password: test123");
            System.out.println("---------------------------------");
        }

        if (!userRepository.existsByUsername("Lazaros1")) {
            User LazarosUser = User.builder()
                    .username("Lazaros1")
                    .email("Lazaros@pms.com") // Dummy email
                    .password(passwordEncoder.encode("Lazaros123")) // Hash the password!
                    .firstName("Lazaros")
                    .lastName("Papadopoulos")
                    .role(Role.MEMBER)
                    .status(Status.PENDING) // The crucial ACTIVE status
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(LazarosUser);

            System.out.println("---------------------------------");
            System.out.println(" Lazaros1 ACCOUNT CREATED");
            System.out.println(" Username: Lazaros1");
            System.out.println(" Password: Lazaros123");
            System.out.println("---------------------------------");
        }

        if (!userRepository.existsByUsername("IoannaSuper")) {
            User IoannaUser = User.builder()
                    .username("IoannaSuper")
                    .email("ioanna@pms.com") // Dummy email
                    .password(passwordEncoder.encode("Ioanna123")) // Hash the password!
                    .firstName("Ioanna")
                    .lastName("Papadopoulou")
                    .role(Role.MEMBER)
                    .status(Status.DISABLED) // The crucial ACTIVE status
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(IoannaUser);

            System.out.println("---------------------------------");
            System.out.println(" IoannaSuper ACCOUNT CREATED");
            System.out.println(" Username: IoannaSuper");
            System.out.println(" Password: Ioanna123");
            System.out.println("---------------------------------");
        }
    }
}
