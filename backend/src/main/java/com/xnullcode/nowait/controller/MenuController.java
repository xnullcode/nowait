package com.xnullcode.nowait.controller;

import com.xnullcode.nowait.entity.MenuItem;
import com.xnullcode.nowait.repository.MenuItemRepository;
import com.xnullcode.nowait.security.CafeUserDetails;
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

    @GetMapping
    public ResponseEntity<List<MenuItem>> getMenu(@AuthenticationPrincipal CafeUserDetails userDetails) {
        return ResponseEntity.ok(menuItemRepository.findByOwnerId(userDetails.getId()));
    }
}
