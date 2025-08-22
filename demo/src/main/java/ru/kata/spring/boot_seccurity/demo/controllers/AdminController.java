package ru.kata.spring.boot_seccurity.demo.controllers;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_seccurity.demo.model.Role;
import ru.kata.spring.boot_seccurity.demo.model.User;
import ru.kata.spring.boot_seccurity.demo.service.RoleService;
import ru.kata.spring.boot_seccurity.demo.service.UserService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserService userService;
    private final RoleService roleService;

    public AdminController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    private void checkAdminRole(UserDetails userDetails) {
        if (userDetails.getAuthorities().stream()
                .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new AccessDeniedException("Access denied");
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(@AuthenticationPrincipal UserDetails userDetails) {
        checkAdminRole(userDetails);
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles(@AuthenticationPrincipal UserDetails userDetails) {
        checkAdminRole(userDetails);
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        checkAdminRole(userDetails);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody Map<String, Object> requestBody,
                                             @AuthenticationPrincipal UserDetails userDetails,
                                             BindingResult bindingResult) {

        try {
            System.out.println("Received POST request body: " + requestBody);

            checkAdminRole(userDetails);

            // Создаем User объект из данных запроса
            User user = new User();
            user.setUsername((String) requestBody.get("username"));
            user.setEmail((String) requestBody.get("email"));
            user.setCountry((String) requestBody.get("country"));
            user.setPassword((String) requestBody.get("password"));

            // Извлекаем roleIds
            List<Long> roleIds = null;
            Object roleIdsObj = requestBody.get("roleIds");
            if (roleIdsObj instanceof List) {
                // Преобразуем List<Object> в List<Long>
                roleIds = ((List<?>) roleIdsObj).stream()
                        .filter(item -> item instanceof Integer || item instanceof Long)
                        .map(item -> ((Number) item).longValue())
                        .collect(Collectors.toList());
            }

            System.out.println("Extracted roleIds for create: " + roleIds);
            System.out.println("Extracted user for create: " + user);

            // Валидация
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Username is required");
            }
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }

            userService.saveUser(user, roleIds);
            return ResponseEntity.ok("User created successfully");

        } catch (Exception e) {
            System.err.println("Error creating user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating user: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id,
                                             @RequestBody Map<String, Object> requestBody,
                                             @AuthenticationPrincipal UserDetails userDetails,
                                             BindingResult bindingResult) {

        System.out.println("Received request body: " + requestBody);

        checkAdminRole(userDetails);

        // Создаем User объект из данных запроса
        User user = new User();
        user.setUsername((String) requestBody.get("username"));
        user.setEmail((String) requestBody.get("email"));
        user.setCountry((String) requestBody.get("country"));
        user.setPassword((String) requestBody.get("password"));

        // Извлекаем roleIds
        List<Long> roleIds = null;
        Object roleIdsObj = requestBody.get("roleIds");
        if (roleIdsObj instanceof List) {
            roleIds = (List<Long>) roleIdsObj;
        }

        System.out.println("Extracted roleIds: " + roleIds);
        System.out.println("Extracted user: " + user);

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation error");
        }

        userService.updateUser(id, user, roleIds);
        return ResponseEntity.ok("User updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        checkAdminRole(userDetails);
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}