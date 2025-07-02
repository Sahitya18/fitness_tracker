package com.fittracker.controller;

import com.fittracker.dto.RegisterRequest;
import com.fittracker.service.OtpService;
import com.fittracker.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.fittracker.dto.OtpRequest;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/registration")
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

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpRequest req) {
        String target = req.getEmail() != null ? req.getEmail() : req.getMobile();
        String otp = req.getOtp();
        
        if (target == null || otp == null) {
            return ResponseEntity.badRequest().body("Both target (email/mobile) and OTP are required");
        }
        
        boolean isValid = otpService.verifyOtp(target, otp);
        return isValid ? 
            ResponseEntity.ok("OTP verified successfully") : 
            ResponseEntity.badRequest().body("Invalid OTP");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        // Validate mobile number format
        if (req.getMobile() != null && !req.getMobile().matches("^[0-9]{10}$")) {
            return ResponseEntity.badRequest().body("Invalid mobile number format. Please enter 10 digits only.");
        }
        return registrationService.registerUser(req);
    }

    @PostMapping("/complete-profile")
    public ResponseEntity<?> completeProfile(@Valid @RequestBody RegisterRequest req) {
        return registrationService.completeUserProfile(req);
    }
}
