package com.fitness.register_service.controller;

import com.fitness.register_service.dto.CreateProfileRequest;
import com.fitness.register_service.dto.RegisterRequest;
import com.fitness.register_service.dto.UpdateProfileRequest;
import com.fitness.register_service.service.CreateProfile;
import com.fitness.register_service.service.UpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class Profile {

    @Autowired
    UpdateService updateService;

    @Autowired
    CreateProfile createProfile;

    @PutMapping("/create-profile")
    public ResponseEntity<?> register(@RequestBody CreateProfileRequest request) {
        System.out.println("🔥 UPDATE USER PROFILE API HIT: ");
        try {
            createProfile.completeUserProfile(request);
            return ResponseEntity.ok("Profile created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody UpdateProfileRequest request) {
        System.out.println("🔥 UPDATE USER PROFILE API HIT: " + request.getEmail() + " - " + request.getField());
        try {
            return updateService.updateUserProfile(request);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "Failed to update profile");
            return ResponseEntity.badRequest().body(error);
        }
    }
}
