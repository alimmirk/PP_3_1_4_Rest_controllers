package ru.kata.spring.boot_seccurity.demo.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_seccurity.demo.model.Role;
import ru.kata.spring.boot_seccurity.demo.model.User;
import ru.kata.spring.boot_seccurity.demo.repositories.UserRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleService roleService;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           RoleService roleService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleService = roleService;
    }

    @Override
    public User getUserById(Long id) {
        return findUserOrThrow(id);
    }

    @Override
    public User findByUserName(String name) {
        return userRepository.findByUsername(name).orElse(null);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    @Override
    public void saveUser(User user, List<Long> roleIds) {
        processRoles(user, roleIds);
        processPassword(user);
        userRepository.save(user);
    }

    @Transactional
    @Override
    public void deleteUser(Long id) {
        User user = findUserOrThrow(id);
        userRepository.delete(user);
    }

    @Transactional
    @Override
    public void updateUser(Long id, User user, List<Long> roleIds) {
        User existingUser = findUserOrThrow(id);

        existingUser.setUsername(user.getUsername());
        existingUser.setCountry(user.getCountry());
        existingUser.setEmail(user.getEmail());

        processPassword(user, existingUser);
        processRoles(existingUser, roleIds);
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("User with id " + id + " not found"));
    }

    private void processRoles(User user, List<Long> roleIds) {
        Optional.ofNullable(roleIds)
                .filter(ids -> !ids.isEmpty())
                .ifPresentOrElse(
                        ids -> {
                            Set<Role> roles = new HashSet<>(roleService.findRolesById(ids));
                            if (roles.isEmpty()) {
                                throw new IllegalStateException("Указанные роли не найдены!");
                            }
                            user.setRoles(roles);
                        },
                        () -> {
                            if (user.getRoles() == null || user.getRoles().isEmpty()) {
                                Role defaultRole = roleService.findByName("ROLE_USER")
                                        .orElseThrow(() -> new IllegalStateException("Default role ROLE_USER not found"));
                                user.setRoles(Set.of(defaultRole));
                            }
                        }
                );
    }

    private void processPassword(User user) {
        Optional.ofNullable(user.getPassword())
                .filter(pass -> !pass.trim().isEmpty())
                .ifPresent(pass -> user.setPassword(passwordEncoder.encode(pass)));
    }

    private void processPassword(User sourceUser, User targetUser) {
        Optional.ofNullable(sourceUser.getPassword())
                .filter(pass -> !pass.trim().isEmpty())
                .filter(pass -> !passwordEncoder.matches(pass, targetUser.getPassword()))
                .ifPresent(pass -> targetUser.setPassword(passwordEncoder.encode(pass)));
    }
}