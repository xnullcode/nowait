package com.xnullcode.nowait.controller;

import com.xnullcode.nowait.dto.OrderItemRequest;
import com.xnullcode.nowait.dto.OrderRequest;
import com.xnullcode.nowait.entity.MenuItem;
import com.xnullcode.nowait.entity.Order;
import com.xnullcode.nowait.entity.OrderItem;
import com.xnullcode.nowait.entity.User;
import com.xnullcode.nowait.repository.MenuItemRepository;
import com.xnullcode.nowait.repository.OrderRepository;
import com.xnullcode.nowait.repository.UserRepository;
import com.xnullcode.nowait.security.CafeUserDetails;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(@AuthenticationPrincipal CafeUserDetails userDetails, @Valid @RequestBody OrderRequest request) {
        User owner = userRepository.findById(userDetails.getId()).orElseThrow();
        Order order = new Order();
        order.setOwner(owner);
        order.setCustomerName(request.getCustomerName());
        order.setPaymentMode(request.getPaymentMode() != null ? request.getPaymentMode().toUpperCase() : "CASH");
        // Cash payments start unverified; online payments are pre-verified
        order.setPaymentVerified("ONLINE".equalsIgnoreCase(order.getPaymentMode()));
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            Optional<MenuItem> menuItemOpt = menuItemRepository.findById(itemReq.getMenuItemId());
            if (menuItemOpt.isEmpty() || !menuItemOpt.get().getOwner().getId().equals(owner.getId())) {
                return ResponseEntity.badRequest().body("Invalid menu item ID: " + itemReq.getMenuItemId());
            }
            
            MenuItem menuItem = menuItemOpt.get();
            if (menuItem.getStock() < itemReq.getQuantity()) {
                return ResponseEntity.badRequest().body("Not enough stock for item: " + menuItem.getName());
            }

            // Deduct stock
            menuItem.setStock(menuItem.getStock() - itemReq.getQuantity());
            menuItemRepository.save(menuItem);

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPriceAtTimeOfOrder(menuItem.getPrice());
            
            BigDecimal itemTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            total = total.add(itemTotal);
            
            order.addItem(orderItem);
        }

        order.setTotalPrice(total);
        Order savedOrder = orderRepository.save(order);
        
        return ResponseEntity.ok(Map.of("orderId", savedOrder.getId(), "message", "Order placed successfully!"));
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@AuthenticationPrincipal CafeUserDetails userDetails, @Valid @RequestBody OrderRequest request) {
        return placeOrder(userDetails, request);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrders(@AuthenticationPrincipal CafeUserDetails userDetails) {
        return ResponseEntity.ok(orderRepository.findAllByOwnerIdOrderByTimestampDesc(userDetails.getId()));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @AuthenticationPrincipal CafeUserDetails userDetails, 
            @PathVariable Long id, 
            @RequestBody Map<String, String> statusUpdate) {
        
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty() || !orderOpt.get().getOwner().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body("Unauthorized or not found");
        }

        String newStatus = statusUpdate.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body("Status is required");
        }

        Order order = orderOpt.get();
        order.setStatus(newStatus.toUpperCase());
        orderRepository.save(order);

        return ResponseEntity.ok(order);
    }

    @PatchMapping("/orders/{id}/verify-payment")
    public ResponseEntity<?> verifyPayment(
            @AuthenticationPrincipal CafeUserDetails userDetails,
            @PathVariable Long id) {

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty() || !orderOpt.get().getOwner().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body("Unauthorized or not found");
        }

        Order order = orderOpt.get();
        order.setPaymentVerified(true);
        orderRepository.save(order);

        return ResponseEntity.ok(order);
    }
}
