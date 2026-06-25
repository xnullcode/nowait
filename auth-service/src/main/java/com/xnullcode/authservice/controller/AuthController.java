package com.xnullcode.authservice.controller;

import com.xnullcode.authservice.dto.AuthResponse;
import com.xnullcode.authservice.dto.LoginRequest;
import com.xnullcode.authservice.dto.RegisterRequest;
import com.xnullcode.authservice.entity.User;
import com.xnullcode.authservice.repository.UserRepository;
import com.xnullcode.authservice.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.xnullcode.authservice.service.MenuServiceClient menuServiceClient;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        User user = new User(request.getUsername(), request.getPassword(), request.getCafeName());
        user.setAdminPasscode(request.getAdminPasscode() != null ? request.getAdminPasscode() : "");
        user.setOrderPasscode(request.getOrderPasscode() != null ? request.getOrderPasscode() : "");
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        
        // Asynchronously seed the default menu by calling menu-service
        new Thread(() -> menuServiceClient.seedDefaultMenu(token)).start();

        return ResponseEntity.ok(new AuthResponse(token, user.getCafeName(), user.getAdminPasscode(), user.getOrderPasscode()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByUsername(request.getUsername());
        
        if (optionalUser.isPresent() && optionalUser.get().getPassword().equals(request.getPassword())) {
            User user = optionalUser.get();
            String token = jwtUtil.generateToken(user.getId(), user.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, user.getCafeName(), user.getAdminPasscode(), user.getOrderPasscode()));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }
}
