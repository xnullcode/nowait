package com.xnullcode.nowait.dto;

public class AuthResponse {
    private String token;
    private String cafeName;
    private String adminPasscode;
    private String orderPasscode;

    public AuthResponse(String token, String cafeName) {
        this.token = token;
        this.cafeName = cafeName;
    }

    public AuthResponse(String token, String cafeName, String adminPasscode, String orderPasscode) {
        this.token = token;
        this.cafeName = cafeName;
        this.adminPasscode = adminPasscode;
        this.orderPasscode = orderPasscode;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getCafeName() { return cafeName; }
    public void setCafeName(String cafeName) { this.cafeName = cafeName; }
    public String getAdminPasscode() { return adminPasscode; }
    public void setAdminPasscode(String adminPasscode) { this.adminPasscode = adminPasscode; }
    public String getOrderPasscode() { return orderPasscode; }
    public void setOrderPasscode(String orderPasscode) { this.orderPasscode = orderPasscode; }
}
