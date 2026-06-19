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
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import jakarta.annotation.PostConstruct;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() throws RazorpayException {
        razorpayClient = new RazorpayClient(keyId, keySecret);
    }

    /**
     * Step 1: Create a Razorpay order. Frontend calls this before opening checkout modal.
     * Returns the Razorpay order ID and the publishable key for the frontend.
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createRazorpayOrder(
            @AuthenticationPrincipal CafeUserDetails userDetails,
            @RequestBody Map<String, Object> body) {

        try {
            // Amount comes in INR from frontend, convert to paise (x100)
            double amountInRupees = Double.parseDouble(body.get("amount").toString());
            int amountInPaise = (int) Math.round(amountInRupees * 100);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());

            com.razorpay.Order rzpOrder = razorpayClient.orders.create(orderRequest);

            return ResponseEntity.ok(Map.of(
                "razorpayOrderId", rzpOrder.get("id").toString(),
                "amount", amountInPaise,
                "currency", "INR",
                "keyId", keyId
            ));
        } catch (RazorpayException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create payment order: " + e.getMessage()));
        }
    }

    /**
     * Step 2: Verify payment signature and place the actual order in our DB.
     * Called after successful Razorpay payment on the frontend.
     */
    @PostMapping("/verify-and-place")
    public ResponseEntity<?> verifyAndPlaceOrder(
            @AuthenticationPrincipal CafeUserDetails userDetails,
            @RequestBody Map<String, Object> body) {

        String razorpayOrderId = (String) body.get("razorpayOrderId");
        String razorpayPaymentId = (String) body.get("razorpayPaymentId");
        String razorpaySignature = (String) body.get("razorpaySignature");

        // Verify signature: HMAC-SHA256 of "orderId|paymentId" using secret
        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes());
            String computedSignature = HexFormat.of().formatHex(hash);

            if (!computedSignature.equals(razorpaySignature)) {
                return ResponseEntity.status(400).body(Map.of("error", "Payment verification failed: invalid signature"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Signature verification error: " + e.getMessage()));
        }

        // Signature valid — now place the order
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
            String customerName = (String) body.get("customerName");

            User owner = userRepository.findById(userDetails.getId()).orElseThrow();
            Order order = new Order();
            order.setOwner(owner);
            order.setCustomerName(customerName);
            BigDecimal total = BigDecimal.ZERO;

            for (Map<String, Object> itemMap : items) {
                Long menuItemId = Long.parseLong(itemMap.get("menuItemId").toString());
                int quantity = Integer.parseInt(itemMap.get("quantity").toString());

                Optional<MenuItem> menuItemOpt = menuItemRepository.findById(menuItemId);
                if (menuItemOpt.isEmpty() || !menuItemOpt.get().getOwner().getId().equals(owner.getId())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid menu item: " + menuItemId));
                }

                MenuItem menuItem = menuItemOpt.get();
                if (menuItem.getStock() < quantity) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Not enough stock for: " + menuItem.getName()));
                }

                menuItem.setStock(menuItem.getStock() - quantity);
                menuItemRepository.save(menuItem);

                OrderItem orderItem = new OrderItem();
                orderItem.setMenuItem(menuItem);
                orderItem.setQuantity(quantity);
                orderItem.setPriceAtTimeOfOrder(menuItem.getPrice());
                total = total.add(menuItem.getPrice().multiply(BigDecimal.valueOf(quantity)));
                order.addItem(orderItem);
            }

            order.setTotalPrice(total);
            Order saved = orderRepository.save(order);

            return ResponseEntity.ok(Map.of(
                "orderId", saved.getId(),
                "message", "Payment successful! Order placed.",
                "razorpayPaymentId", razorpayPaymentId
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Order placement failed: " + e.getMessage()));
        }
    }
}
