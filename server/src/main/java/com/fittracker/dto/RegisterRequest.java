package com.fittracker.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String mobile;
    private String password;
    private String otp;

    public String getEmail() {
        return email;
    }

    public String getMobile() {
        return mobile;
    }

    public String getPassword() {
        return password;
    }

    public String getOtp() {
        return otp;
    }
}