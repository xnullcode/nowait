package com.xnullcode.orderservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Service
public class MenuServiceClient {

    private final RestTemplate restTemplate;
    private final String menuServiceUrl;

    public MenuServiceClient(RestTemplate restTemplate, @Value("${menu.service.url:http://localhost:8082}") String menuServiceUrl) {
        this.restTemplate = restTemplate;
        this.menuServiceUrl = menuServiceUrl;
    }

    public static class MenuItemInfo {
        public Long id;
        public String name;
        public BigDecimal price;
        public Integer stock;
        public Long ownerId;
    }

    public MenuItemInfo getMenuItemAndDeductStock(Long menuItemId, Integer quantityToDeduct, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // We assume menu-service has an endpoint: POST /api/products/{id}/deduct-stock?quantity=X
        ResponseEntity<MenuItemInfo> response = restTemplate.exchange(
                menuServiceUrl + "/api/products/" + menuItemId + "/deduct-stock?quantity=" + quantityToDeduct,
                HttpMethod.POST,
                entity,
                MenuItemInfo.class
        );

        return response.getBody();
    }
}
