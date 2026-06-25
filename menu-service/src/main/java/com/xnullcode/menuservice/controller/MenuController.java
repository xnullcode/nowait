package com.xnullcode.menuservice.controller;

import com.xnullcode.menuservice.entity.MenuItem;
import com.xnullcode.menuservice.repository.MenuItemRepository;
import com.xnullcode.menuservice.security.CafeUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private com.xnullcode.menuservice.service.DefaultMenuSeeder defaultMenuSeeder;

    @GetMapping
    public ResponseEntity<List<MenuItem>> getMenu(@AuthenticationPrincipal CafeUserDetails userDetails) {
        return ResponseEntity.ok(menuItemRepository.findByOwnerId(userDetails.getId()));
    }

    @org.springframework.web.bind.annotation.PostMapping("/seed")
    public ResponseEntity<?> seedDefaultMenu(@AuthenticationPrincipal CafeUserDetails userDetails) {
        defaultMenuSeeder.seedDefaultItems(userDetails.getId());
        return ResponseEntity.ok(java.util.Map.of("message", "Default menu items seeded successfully"));
    }
}
