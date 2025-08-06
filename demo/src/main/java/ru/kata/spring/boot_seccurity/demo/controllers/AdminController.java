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
    public ResponseEntity<String> createUser(@RequestBody @Valid User user,
                                             @RequestParam(required = false) List<Long> roleIds,
                                             BindingResult bindingResult,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        checkAdminRole(userDetails);
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation error");
        }
        userService.saveUser(user, roleIds);
        return ResponseEntity.ok("User created successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id,
                                             @RequestBody @Valid User user,
                                             @RequestParam(required = false) List<Long> roleIds,
                                             BindingResult bindingResult,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        checkAdminRole(userDetails);
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