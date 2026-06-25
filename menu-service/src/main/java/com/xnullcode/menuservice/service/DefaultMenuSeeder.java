package com.xnullcode.menuservice.service;

import com.xnullcode.menuservice.entity.MenuItem;
import com.xnullcode.menuservice.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class DefaultMenuSeeder {

    @Autowired
    private MenuItemRepository menuItemRepository;

    public void seedDefaultItems(Long ownerId) {
        List<MenuItem> existingItems = menuItemRepository.findByOwnerId(ownerId);
        List<String> existingNames = new ArrayList<>();
        for (MenuItem item : existingItems) {
            existingNames.add(item.getName());
        }

        List<MenuItem> defaultItems = new ArrayList<>();

        if (!existingNames.contains("Masala Chai")) {
            defaultItems.add(createItem(ownerId, "Masala Chai", "Beverages", 
                "Authentic Indian spiced tea brewed with fresh milk and cardamom.", "120.00", "/assets/default_items/masala_chai.png"));
        }
            
        if (!existingNames.contains("Filter Coffee")) {
            defaultItems.add(createItem(ownerId, "Filter Coffee", "Beverages", 
                "Traditional South Indian strong coffee served frothy.", "100.00", "/assets/default_items/filter_coffee.png"));
        }
            
        if (!existingNames.contains("Bombay Sandwich")) {
            defaultItems.add(createItem(ownerId, "Bombay Sandwich", "Wraps & sandwiches", 
                "Classic Mumbai street food style sandwich with veggies and cheese.", "180.00", "/assets/default_items/bombay_sandwich.png"));
        }
            
        if (!existingNames.contains("Mawa Cake")) {
            defaultItems.add(createItem(ownerId, "Mawa Cake", "Baked goods", 
                "Rich, dense, and buttery cardamom-flavored Parsi cafe style cake.", "130.00", "/assets/default_items/mawa_cake.png"));
        }
            
        if (!existingNames.contains("Paneer Tikka Wrap")) {
            defaultItems.add(createItem(ownerId, "Paneer Tikka Wrap", "Wraps & sandwiches", 
                "Spicy paneer chunks wrapped in a soft paratha with mint chutney.", "220.00", "/assets/default_items/paneer_wrap.png"));
        }
            
        if (!existingNames.contains("Samosa Chaat")) {
            defaultItems.add(createItem(ownerId, "Samosa Chaat", "Bowls & salads", 
                "Crushed samosas topped with yogurt, tamarind, and mint chutneys.", "150.00", "/assets/default_items/samosa_chaat.png"));
        }

        if (!defaultItems.isEmpty()) {
            menuItemRepository.saveAll(defaultItems);
        }
    }

    private MenuItem createItem(Long ownerId, String name, String category, String description, String price, String imageUrl) {
        MenuItem item = new MenuItem();
        item.setOwnerId(ownerId);
        item.setName(name);
        item.setCategory(category);
        item.setDescription(description);
        item.setPrice(new BigDecimal(price));
        item.setStock(50);
        item.setImageFileName(imageUrl);
        return item;
    }
}
