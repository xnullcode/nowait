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
import com.xnullcode.nowait.repository.MenuItemRepository;
import com.xnullcode.nowait.entity.MenuItem;
import java.math.BigDecimal;
import java.util.List;
import java.util.Arrays;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        User user = new User(request.getUsername(), request.getPassword(), request.getCafeName());
        user.setAdminPasscode(request.getAdminPasscode() != null ? request.getAdminPasscode() : "");
        user.setOrderPasscode(request.getOrderPasscode() != null ? request.getOrderPasscode() : "");
        userRepository.save(user);

        List<MenuItem> defaultItems = Arrays.asList(
            createMenuItem(user, "Masala Chai", "120.00", "Beverages", "Authentic Indian spiced tea brewed with fresh milk and cardamom.", 50, "/assets/default_items/masala_chai.png"),
            createMenuItem(user, "Filter Coffee", "100.00", "Beverages", "Traditional South Indian strong coffee served frothy.", 50, "/assets/default_items/filter_coffee.png"),
            createMenuItem(user, "Paneer Tikka Wrap", "220.00", "Wraps & sandwiches", "Spicy paneer chunks wrapped in a soft paratha with mint chutney.", 30, "/assets/default_items/paneer_wrap.png"),
            createMenuItem(user, "Bombay Sandwich", "180.00", "Wraps & sandwiches", "Classic Mumbai street food style sandwich with veggies and cheese.", 30, "/assets/default_items/bombay_sandwich.png"),
            createMenuItem(user, "Samosa Chaat", "150.00", "Bowls & salads", "Crushed samosas topped with yogurt, tamarind, and mint chutneys.", 40, "/assets/default_items/samosa_chaat.png"),
            createMenuItem(user, "Mawa Cake", "130.00", "Baked goods", "Rich, dense, and buttery cardamom-flavored Parsi cafe style cake.", 25, "/assets/default_items/mawa_cake.png")
        );
        menuItemRepository.saveAll(defaultItems);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, user.getCafeName(), user.getAdminPasscode(), user.getOrderPasscode()));
    }

    private MenuItem createMenuItem(User owner, String name, String price, String category, String description, int stock, String imagePath) {
        MenuItem item = new MenuItem();
        item.setOwner(owner);
        item.setName(name);
        item.setPrice(new BigDecimal(price));
        item.setCategory(category);
        item.setDescription(description);
        item.setStock(stock);
        item.setImageFileName(imagePath);
        return item;
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
