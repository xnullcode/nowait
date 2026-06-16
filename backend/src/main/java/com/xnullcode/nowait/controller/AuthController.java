package com.xnullcode.nowait.controller;

import com.xnullcode.nowait.dto.AuthResponse;
import com.xnullcode.nowait.dto.LoginRequest;
import com.xnullcode.nowait.dto.RegisterRequest;
import com.xnullcode.nowait.entity.User;
import com.xnullcode.nowait.repository.UserRepository;
import com.xnullcode.nowait.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        User user = new User(request.getUsername(), request.getPassword(), request.getCafeName());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, user.getCafeName()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByUsername(request.getUsername());
        
        if (optionalUser.isPresent() && optionalUser.get().getPassword().equals(request.getPassword())) {
            User user = optionalUser.get();
            String token = jwtUtil.generateToken(user.getId(), user.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, user.getCafeName()));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }
}
