package com.xnullcode.orderservice.controller;

import com.xnullcode.orderservice.dto.OrderItemRequest;
import com.xnullcode.orderservice.dto.OrderRequest;
import com.xnullcode.orderservice.entity.Order;
import com.xnullcode.orderservice.entity.OrderItem;
import com.xnullcode.orderservice.repository.OrderRepository;
import com.xnullcode.orderservice.security.CafeUserDetails;
import com.xnullcode.orderservice.service.MenuServiceClient;
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
    private MenuServiceClient menuServiceClient;

    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(
            @AuthenticationPrincipal CafeUserDetails userDetails,
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody OrderRequest request) {
            
        Order order = new Order();
        order.setOwnerId(userDetails.getId());
        order.setCustomerName(request.getCustomerName());
        order.setPaymentMode(request.getPaymentMode() != null ? request.getPaymentMode().toUpperCase() : "CASH");
        order.setPaymentVerified("ONLINE".equalsIgnoreCase(order.getPaymentMode()));
        BigDecimal total = BigDecimal.ZERO;

        try {
            for (OrderItemRequest itemReq : request.getItems()) {
                MenuServiceClient.MenuItemInfo menuItem = menuServiceClient.getMenuItemAndDeductStock(itemReq.getMenuItemId(), itemReq.getQuantity(), token);

                if (menuItem == null || !menuItem.ownerId.equals(userDetails.getId())) {
                    return ResponseEntity.badRequest().body("Invalid menu item ID or unauthorized: " + itemReq.getMenuItemId());
                }

                OrderItem orderItem = new OrderItem();
                orderItem.setMenuItemId(menuItem.id);
                orderItem.setProductName(menuItem.name);
                orderItem.setQuantity(itemReq.getQuantity());
                orderItem.setPriceAtTimeOfOrder(menuItem.price);
                
                BigDecimal itemTotal = menuItem.price.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                total = total.add(itemTotal);
                
                order.addItem(orderItem);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error validating stock with menu-service: " + e.getMessage());
        }

        order.setTotalPrice(total);

        // Fetch max order number for owner and increment
        Long nextOrderNumber = orderRepository.findMaxOrderNumberByOwnerId(userDetails.getId()) + 1;
        order.setOrderNumber(nextOrderNumber);

        Order savedOrder = orderRepository.save(order);
        
        return ResponseEntity.ok(Map.of("orderId", savedOrder.getId(), "orderNumber", savedOrder.getOrderNumber(), "message", "Order placed successfully!"));
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @AuthenticationPrincipal CafeUserDetails userDetails,
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody OrderRequest request) {
        return placeOrder(userDetails, token, request);
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
        if (orderOpt.isEmpty() || !orderOpt.get().getOwnerId().equals(userDetails.getId())) {
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
        if (orderOpt.isEmpty() || !orderOpt.get().getOwnerId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body("Unauthorized or not found");
        }

        Order order = orderOpt.get();
        order.setPaymentVerified(true);
        orderRepository.save(order);

        return ResponseEntity.ok(order);
    }
}
