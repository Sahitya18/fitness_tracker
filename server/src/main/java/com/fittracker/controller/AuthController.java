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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;
    @Autowired private OtpService otpService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/send-email-otp")
    public ResponseEntity<?> sendEmailOtp(@RequestBody OtpRequest req) {
        if (!req.getEmail().matches("^[\\w.-]+@[\\w.-]+\\.\\w+$"))
            return ResponseEntity.badRequest().body("Invalid email");
        otpService.generateAndSendOtp(req.getEmail());
        return ResponseEntity.ok("OTP sent");
    }

    @PostMapping("/send-mobile-otp")
    public ResponseEntity<?> sendMobileOtp(@RequestBody OtpRequest req) {
        if (!req.getMobile().matches("\\d{10}"))
            return ResponseEntity.badRequest().body("Invalid mobile");
        otpService.generateAndSendOtp(req.getMobile());
        return ResponseEntity.ok("OTP sent");
    }
}

