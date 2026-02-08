package com.fittracker.controller;

import com.fittracker.dto.RegisterRequest;
import com.fittracker.service.OtpService;
import com.fittracker.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.fittracker.dto.OtpRequest;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/registration")
public class RegistrationController {

    @Autowired private OtpService otpService;
    @Autowired private RegistrationService registrationService;

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

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpRequest req) {
        String target = req.getEmail() != null ? req.getEmail() : req.getMobile();
        String otp = req.getOtp();
        
        if (target == null || otp == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Both target (email/mobile) and OTP are required");
            return ResponseEntity.badRequest().body(error);
        }
        
        boolean isValid = otpService.verifyOtp(target, otp);
        if (isValid) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP verified successfully");
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid OTP");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        // Validate mobile number format
        if (req.getMobile() != null && !req.getMobile().matches("^[0-9]{10}$")) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid mobile number format. Please enter 10 digits only.");
            return ResponseEntity.badRequest().body(error);
        }
        return registrationService.registerUser(req);
    }

    @PostMapping("/complete-profile")
    public ResponseEntity<?> completeProfile(@Valid @RequestBody RegisterRequest req) {
        return registrationService.completeUserProfile(req);
    }
}
