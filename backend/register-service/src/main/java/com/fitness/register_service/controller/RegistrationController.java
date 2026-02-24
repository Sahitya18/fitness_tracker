package com.fitness.register_service.controller;

import com.fitness.register_service.dto.RegisterRequest;
import com.fitness.register_service.service.OtpService;
import com.fitness.register_service.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/registration")
public class RegistrationController {
//    @Autowired
//    private OtpService otpService;
    @Autowired
    private RegistrationService registrationService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        System.out.println("🔥 REGISTER API HIT: " + request.getEmail());
        // Validate mobile number format
        if (request.getMobile() != null && !request.getMobile().matches("^[0-9]{10}$")) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid mobile number format. Please enter 10 digits only.");
            return ResponseEntity.badRequest().body(error);
        }
        return registrationService.registerUser(request);
    }

//    @PostMapping("/send-email-otp")
//    public ResponseEntity<?> sendEmailOtp(@RequestBody OtpRequest req) {
//        if (!req.getEmail().matches("^[\\w.-]+@[\\w.-]+\\.\\w+$")) {
//            Map<String, String> error = new HashMap<>();
//            error.put("error", "Invalid email");
//            return ResponseEntity.badRequest().body(error);
//        }
//        otpService.generateAndSendOtp(req.getEmail());
//        Map<String, String> response = new HashMap<>();
//        response.put("message", "OTP sent");
//        return ResponseEntity.ok(response);
//
//    }
//
//    @PostMapping("/verify-otp")
//    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpRequest req) {
//        String target = req.getEmail() != null ? req.getEmail() : req.getMobile();
//        String otp = req.getOtp();
//
//        if (target == null || otp == null) {
//            Map<String, String> error = new HashMap<>();
//            error.put("error", "Both target (email/mobile) and OTP are required");
//            return ResponseEntity.badRequest().body(error);
//        }
//
//        boolean isValid = otpService.verifyOtp(target, otp);
//        if (isValid) {
//            Map<String, String> response = new HashMap<>();
//            response.put("message", "OTP verified successfully");
//            return ResponseEntity.ok(response);
//        } else {
//            Map<String, String> error = new HashMap<>();
//            error.put("error", "Invalid OTP");
//            return ResponseEntity.badRequest().body(error);
//        }
//    }
}
