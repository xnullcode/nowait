package com.xnullcode.nowait.dto;

import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Cafe Name is required")
    private String cafeName;

    private String adminPasscode;
    private String orderPasscode;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getCafeName() { return cafeName; }
    public void setCafeName(String cafeName) { this.cafeName = cafeName; }

    public String getAdminPasscode() { return adminPasscode; }
    public void setAdminPasscode(String adminPasscode) { this.adminPasscode = adminPasscode; }

    public String getOrderPasscode() { return orderPasscode; }
    public void setOrderPasscode(String orderPasscode) { this.orderPasscode = orderPasscode; }
}
