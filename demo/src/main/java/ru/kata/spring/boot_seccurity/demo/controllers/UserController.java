package ru.kata.spring.boot_seccurity.demo.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_seccurity.demo.model.User;
import ru.kata.spring.boot_seccurity.demo.service.UserService;

import java.security.Principal;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<User> getCurrentUser(Principal principal) {
        User user = userService.findByUserName(principal.getName());
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody User updatedUser,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Проверяем, что пользователь обновляет свой профиль
        User currentUser = userService.findByUserName(userDetails.getUsername());
        if (currentUser == null || !currentUser.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        try {
            // Создаем временный объект User с обновленными полями
            User userUpdates = new User();
            userUpdates.setUsername(updatedUser.getUsername());
            userUpdates.setEmail(updatedUser.getEmail());
            userUpdates.setCountry(updatedUser.getCountry());
            userUpdates.setPassword(updatedUser.getPassword()); // Пароль будет обработан в processPassword

            // Вызываем сервис с null для roles (обычный пользователь не может менять роли)
            userService.updateUser(id, userUpdates, null);

            // Возвращаем обновленного пользователя
            User updated = userService.findByUserName(userUpdates.getUsername());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating user: " + e.getMessage());
        }
    }
}