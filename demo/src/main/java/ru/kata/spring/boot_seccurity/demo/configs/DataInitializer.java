package ru.kata.spring.boot_seccurity.demo.configs;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import ru.kata.spring.boot_seccurity.demo.model.Role;
import ru.kata.spring.boot_seccurity.demo.model.User;
import ru.kata.spring.boot_seccurity.demo.repositories.RoleRepository;
import ru.kata.spring.boot_seccurity.demo.repositories.UserRepository;

import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    public ApplicationRunner initializeDefaultUsers(UserRepository userRepository,
                                                    RoleRepository roleRepository,
                                                    PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                setupInitialUserData(userRepository, roleRepository, passwordEncoder);
                System.out.println("Default users initialized successfully");
            } catch (Exception e) {
                System.err.println("Error initializing default users: " + e.getMessage());
            }
        };
    }

    private void setupInitialUserData(UserRepository userRepository,
                                      RoleRepository roleRepository,
                                      PasswordEncoder passwordEncoder) {

        Role userRole = roleRepository
                .findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_USER")));

        Role adminRole = roleRepository
                .findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_ADMIN")));

        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRoles(Set.of(adminRole, userRole));
            admin.setEmail("admin@admin.ru");
            admin.setCountry("Russian");
            userRepository.save(admin);
        }

        if (userRepository.findByUsername("user").isEmpty()) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRoles(Set.of(userRole));
            user.setEmail("user@user.ru");
            user.setCountry("Poland");
            userRepository.save(user);
        }
    }
}