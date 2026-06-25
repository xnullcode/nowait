package com.xnullcode.authservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MenuServiceClient {

    private final RestTemplate restTemplate;
    private final String menuServiceUrl;

    public MenuServiceClient(RestTemplate restTemplate, @Value("${menu.service.url:http://localhost:8082}") String menuServiceUrl) {
        this.restTemplate = restTemplate;
        this.menuServiceUrl = menuServiceUrl;
    }

    public void seedDefaultMenu(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token); // or whatever format is used, actually JwtFilter parses Bearer or raw token. We'll send it raw if we just generated it. 
        // Wait, the client sends "Bearer token". Let's send "Bearer " + token.
        headers.set("Authorization", "Bearer " + token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(menuServiceUrl + "/api/menu/seed", HttpMethod.POST, entity, Void.class);
        } catch (Exception e) {
            System.err.println("Failed to seed default menu: " + e.getMessage());
            // We ignore the error so registration doesn't roll back, as requested
        }
    }
}
