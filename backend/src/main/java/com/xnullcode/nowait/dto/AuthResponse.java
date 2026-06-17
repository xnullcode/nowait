package com.xnullcode.nowait.dto;

public class AuthResponse {
    private String token;
    private String cafeName;

    public AuthResponse(String token, String cafeName) {
        this.token = token;
        this.cafeName = cafeName;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getCafeName() { return cafeName; }
    public void setCafeName(String cafeName) { this.cafeName = cafeName; }
}
