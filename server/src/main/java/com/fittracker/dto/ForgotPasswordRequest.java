package com.fittracker.dto;

@Data
public class ForgotPasswordRequest {
    private String email;
    private String newPassword;
    private String otp;
}
