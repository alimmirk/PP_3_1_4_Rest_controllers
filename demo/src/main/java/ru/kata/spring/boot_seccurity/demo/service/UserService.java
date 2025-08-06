package ru.kata.spring.boot_seccurity.demo.service;

import ru.kata.spring.boot_seccurity.demo.model.User;

import java.util.List;

public interface UserService {

    User getUserById(Long id);

    User findByUserName(String name);

    List<User> getAllUsers();

    void saveUser(User user, List<Long> roleIds);

    void deleteUser(Long id);

    void updateUser(Long id, User user, List<Long> roleIds);
}
