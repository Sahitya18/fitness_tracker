package com.fittracker.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
    private String newPassword;
    private String otp;

    public String getEmail() {
        return email;
    }
    public String getNewPassword() {
        return newPassword;
    }
    public String getOtp() {
        return otp;
    }
}
