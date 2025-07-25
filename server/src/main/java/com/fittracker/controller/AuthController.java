package com.fittracker.controller;

import com.fittracker.service.AuthService;
import com.fittracker.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.fittracker.dto.LoginRequest;
import com.fittracker.dto.OtpRequest;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;
    @Autowired private OtpService otpService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            return authService.login(req);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "Unknown error");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/send-email-otp")
    public ResponseEntity<?> sendEmailOtp(@RequestBody OtpRequest req) {
        if (!req.getEmail().matches("^[\\w.-]+@[\\w.-]+\\.\\w+$")) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid email");
            return ResponseEntity.badRequest().body(error);
        }
        otpService.generateAndSendOtp(req.getEmail());
        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-mobile-otp")
    public ResponseEntity<?> sendMobileOtp(@RequestBody OtpRequest req) {
        if (!req.getMobile().matches("\\d{10}")) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid mobile");
            return ResponseEntity.badRequest().body(error);
        }
        otpService.generateAndSendOtp(req.getMobile());
        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent");
        return ResponseEntity.ok(response);
    }
}

