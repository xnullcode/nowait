package com.xnullcode.menuservice.controller;

import com.xnullcode.menuservice.entity.MenuItem;
import com.xnullcode.menuservice.repository.MenuItemRepository;
import com.xnullcode.menuservice.security.CafeUserDetails;
import com.xnullcode.menuservice.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private StorageService fileStorageService;

    @PostMapping
    public ResponseEntity<?> addProduct(
            @AuthenticationPrincipal CafeUserDetails userDetails,
            @RequestParam("name") String name,
            @RequestParam("price") BigDecimal price,
            @RequestParam("category") String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("stock") Integer stock,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            MenuItem item = new MenuItem();
            item.setOwnerId(userDetails.getId());
            item.setName(name);
            item.setPrice(price);
            item.setCategory(category);
            item.setDescription(description);
            item.setStock(stock);

            if (image != null && !image.isEmpty()) {
                String fileName = fileStorageService.storeFile(userDetails.getId(), image);
                item.setImageFileName(fileName);
            }

            return ResponseEntity.ok(menuItemRepository.save(item));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding product: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @AuthenticationPrincipal CafeUserDetails userDetails,
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("price") BigDecimal price,
            @RequestParam("category") String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("stock") Integer stock,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            Optional<MenuItem> optItem = menuItemRepository.findById(id);
            if (optItem.isEmpty() || !optItem.get().getOwnerId().equals(userDetails.getId())) {
                return ResponseEntity.status(403).body("Unauthorized or not found");
            }

            MenuItem item = optItem.get();
            item.setName(name);
            item.setPrice(price);
            item.setCategory(category);
            item.setDescription(description);
            item.setStock(stock);

            if (image != null && !image.isEmpty()) {
                fileStorageService.deleteFile(userDetails.getId(), item.getImageFileName());
                String fileName = fileStorageService.storeFile(userDetails.getId(), image);
                item.setImageFileName(fileName);
            }

            return ResponseEntity.ok(menuItemRepository.save(item));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating product: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@AuthenticationPrincipal CafeUserDetails userDetails, @PathVariable Long id) {
        Optional<MenuItem> optItem = menuItemRepository.findById(id);
        if (optItem.isEmpty() || !optItem.get().getOwnerId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body("Unauthorized or not found");
        }

        MenuItem item = optItem.get();
        fileStorageService.deleteFile(userDetails.getId(), item.getImageFileName());
        menuItemRepository.delete(item);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/deduct-stock")
    public ResponseEntity<?> deductStock(
            @AuthenticationPrincipal CafeUserDetails userDetails,
            @PathVariable Long id,
            @RequestParam("quantity") Integer quantity) {

        Optional<MenuItem> optItem = menuItemRepository.findById(id);
        if (optItem.isEmpty() || !optItem.get().getOwnerId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body("Unauthorized or not found");
        }

        MenuItem item = optItem.get();
        if (item.getStock() < quantity) {
            return ResponseEntity.badRequest().body("Insufficient stock");
        }

        item.setStock(item.getStock() - quantity);
        menuItemRepository.save(item);

        return ResponseEntity.ok(Map.of(
            "id", item.getId(),
            "name", item.getName(),
            "price", item.getPrice(),
            "stock", item.getStock(),
            "ownerId", item.getOwnerId()
        ));
    }
}
