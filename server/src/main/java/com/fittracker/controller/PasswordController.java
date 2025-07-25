package com.fittracker.controller;

import com.fittracker.dto.ForgotPasswordRequest;
import com.fittracker.dto.ResetPasswordRequest;
import com.fittracker.service.PasswordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/password")
public class PasswordController {
    @Autowired private PasswordService passwordService;

    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        System.out.println("Forgot password request received for email: " + req.getEmail());
        passwordService.createAndSendResetToken(req.getEmail());
        Map<String, String> response = new HashMap<>();
        response.put("message", "If the email exists, a reset link has been sent.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Passwords do not match");
            return ResponseEntity.badRequest().body(error);
        }
        boolean valid = passwordService.validateResetToken(req.getToken());
        if (!valid) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid or expired token");
            return ResponseEntity.badRequest().body(error);
        }
        boolean success = passwordService.resetPassword(req.getToken(), req.getNewPassword());
        if (!success) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Could not reset password");
            return ResponseEntity.badRequest().body(error);
        }
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successful");
        return ResponseEntity.ok(response);
    }
} 