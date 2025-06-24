package com.fittracker.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;

    public String getEmail() {
        return email;
    }
    public String getPassword() {
        return password;
    }
}
