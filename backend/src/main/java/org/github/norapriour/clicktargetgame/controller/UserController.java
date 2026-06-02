package org.github.norapriour.clicktargetgame.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.github.norapriour.clicktargetgame.model.User;
import org.github.norapriour.clicktargetgame.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    public UserController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,
                          SecurityContextRepository securityContextRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
    }

    private void authenticateUser(
            String username,
            String password,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(
                        username,
                        password
                )
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }

    @PostMapping("/register")
    public String register(
            @RequestBody User user,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return "Username already exists";
        }

        String plainPassword = user.getPassword();

        user.setPassword(passwordEncoder.encode(plainPassword));
        userRepository.save(user);

        authenticateUser(user.getUsername(), plainPassword, request, response);

        return "User created";
    }

    @PostMapping("/login")
    public String login(
            @RequestBody User user,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        authenticateUser(user.getUsername(), user.getPassword(), request, response);

        return "Login successful";
    }

    @GetMapping("/me")
    public String getCurrentUser(Authentication authentication) {
        return authentication.getName();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.noContent().build();
    }
}
