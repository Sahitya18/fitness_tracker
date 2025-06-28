package com.fittracker.controller;

import com.fittracker.dto.RegisterRequest;
import com.fittracker.service.OtpService;
import com.fittracker.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.fittracker.dto.OtpRequest;
import org.springframework.web.bind.annotation.*;

public class RegistrationController {

    @Autowired private OtpService otpService;
    @Autowired private RegistrationService registrationService;

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

    @PostMapping
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        return registrationService.registerUser(req);
    }
}
