package com.fitness.auth_service.controller;

import com.fitness.auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserProfileController {

    @Autowired
    private AuthService authService;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String authorization) {
        System.out.println("🔥 GET USER PROFILE API HIT");
        try {
            return authService.getUserProfile(authorization);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "Failed to fetch user profile");
            return ResponseEntity.badRequest().body(error);
        }
    }
}
