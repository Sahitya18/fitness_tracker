package com.fittracker.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
    private String newPassword;
    private String otp;

}
