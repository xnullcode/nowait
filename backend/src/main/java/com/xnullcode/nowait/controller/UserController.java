package com.xnullcode.nowait.controller;

import com.xnullcode.nowait.dto.AuthResponse;
import com.xnullcode.nowait.entity.User;
import com.xnullcode.nowait.repository.UserRepository;
import com.xnullcode.nowait.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> request) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(currentUsername);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        User user = userOpt.get();
        String newUsername = request.get("username");
        String newPassword = request.get("password");
        String newCafeName = request.get("cafeName");
        String newAdminPasscode = request.get("adminPasscode");
        String newOrderPasscode = request.get("orderPasscode");

        boolean needsNewToken = false;

        if (newUsername != null && !newUsername.trim().isEmpty() && !newUsername.equals(currentUsername)) {
            if (userRepository.findByUsername(newUsername).isPresent()) {
                return ResponseEntity.badRequest().body("Username already exists");
            }
            user.setUsername(newUsername);
            needsNewToken = true;
        }
        
        if (newCafeName != null && !newCafeName.trim().isEmpty()) {
            user.setCafeName(newCafeName);
            needsNewToken = true;
        }

        if (newPassword != null && !newPassword.trim().isEmpty()) {
            user.setPassword(newPassword);
        }

        if (newAdminPasscode != null && !newAdminPasscode.trim().isEmpty()) {
            user.setAdminPasscode(newAdminPasscode);
        }

        if (newOrderPasscode != null && !newOrderPasscode.trim().isEmpty()) {
            user.setOrderPasscode(newOrderPasscode);
        }

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, user.getCafeName(), user.getAdminPasscode(), user.getOrderPasscode()));
    }
}
