package com.fittracker.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String mobile;
    private String password;
    private String otp;

}