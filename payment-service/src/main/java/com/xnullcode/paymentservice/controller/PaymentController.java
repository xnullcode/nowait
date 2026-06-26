package com.xnullcode.paymentservice.controller;

import com.xnullcode.paymentservice.security.CafeUserDetails;
import com.xnullcode.paymentservice.service.OrderServiceClient;
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
import java.util.HexFormat;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Autowired
    private OrderServiceClient orderServiceClient;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() throws RazorpayException {
        razorpayClient = new RazorpayClient(keyId, keySecret);
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createRazorpayOrder(
            @AuthenticationPrincipal CafeUserDetails userDetails,
            @RequestBody Map<String, Object> body) {

        try {
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

    @PostMapping("/verify-and-place")
    public ResponseEntity<?> verifyAndPlaceOrder(
            @AuthenticationPrincipal CafeUserDetails userDetails,
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> body) {

        String razorpayOrderId = (String) body.get("razorpayOrderId");
        String razorpayPaymentId = (String) body.get("razorpayPaymentId");
        String razorpaySignature = (String) body.get("razorpaySignature");

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

        // Signature valid — forward the payload to order-service to place the order
        try {
            // Forwarding the entire body, order-service ignores razorpay fields
            body.put("paymentMode", "ONLINE");
            ResponseEntity<Map> response = orderServiceClient.placeOrder(body, token);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                responseBody.put("razorpayPaymentId", razorpayPaymentId);
                return ResponseEntity.ok(responseBody);
            } else {
                return ResponseEntity.status(response.getStatusCode()).body(Map.of("error", "Failed to place order via order-service"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Order placement failed: " + e.getMessage()));
        }
    }
}
