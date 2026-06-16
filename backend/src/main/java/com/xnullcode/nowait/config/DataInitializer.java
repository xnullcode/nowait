package com.xnullcode.nowait.config;

import com.xnullcode.nowait.entity.MenuItem;
import com.xnullcode.nowait.entity.User;
import com.xnullcode.nowait.repository.MenuItemRepository;
import com.xnullcode.nowait.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User owner = new User("admin", "password123", "Demo Cafe");
            userRepository.save(owner);

            MenuItem item1 = new MenuItem();
            item1.setOwner(owner);
            item1.setName("Espresso");
            item1.setPrice(new BigDecimal("50.00"));
            item1.setCategory("coffee");
            item1.setDescription("Strong and bold shot of espresso.");
            item1.setStock(100);
            menuItemRepository.save(item1);

            MenuItem item2 = new MenuItem();
            item2.setOwner(owner);
            item2.setName("Croissant");
            item2.setPrice(new BigDecimal("80.00"));
            item2.setCategory("pastry");
            item2.setDescription("Flaky, buttery perfection.");
            item2.setStock(50);
            menuItemRepository.save(item2);
        }
    }
}
