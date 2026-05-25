package org.github.norapriour.clicktargetgame.controller;

import org.github.norapriour.clicktargetgame.model.User;
import org.github.norapriour.clicktargetgame.repository.UserRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return "Username already exists";
        }

        userRepository.save(user);
        return "User created";
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
        if (existingUser.isEmpty()) {
            return "Invalid username or password";
        }
        User foundUser = existingUser.get();
        if (foundUser.getPassword().equals(user.getPassword())) {
            return "Login successful";
        }
        return "Invalid username or password";
    }
}
