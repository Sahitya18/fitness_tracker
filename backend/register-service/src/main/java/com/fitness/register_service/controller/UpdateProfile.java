package com.fitness.register_service.controller;

import com.fitness.register_service.dto.RegisterRequest;
import com.fitness.register_service.dto.UpdateRequest;
import com.fitness.register_service.dto.UpdateProfileRequest;
import com.fitness.register_service.service.UpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UpdateProfile {

    @Autowired
    UpdateService updateService;

    @PutMapping("/update/profile")
    public ResponseEntity<?> register(@RequestBody UpdateRequest request) {
        if (request.getKeyValuePairList().get(0).value==null || request.getKeyValuePairList().get(1).value==null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email id or field value is empty.");
            return ResponseEntity.badRequest().body(error);
        }
        return updateService.updateUser(request);
    }

    @PutMapping("/user/update-profile")
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
