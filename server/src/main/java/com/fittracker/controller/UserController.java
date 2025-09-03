package com.fittracker.controller;

import com.fittracker.model.User;
import com.fittracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody Map<String, Object> updates) {
        try {
            // Get current user from authentication context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("Authentication: " + authentication);
            System.out.println("Authentication name: " + (authentication != null ? authentication.getName() : "null"));
            
            if (authentication == null || authentication.getName() == null || authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.badRequest().body("Authentication required");
            }
            
            String userEmail = authentication.getName();
            System.out.println("Looking for user with email: " + userEmail);
            
            // Find user by email
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                System.out.println("User not found for email: " + userEmail);
                return ResponseEntity.badRequest().body("User not found");
            }

            User user = userOpt.get();
            
            // Update user profile
            User updatedUser = userService.updateUserProfile(user.getId(), updates);
            
            return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "user", Map.of(
                    "id", updatedUser.getId(),
                    "email", updatedUser.getEmail(),
                    "firstName", updatedUser.getFirstName(),
                    "lastName", updatedUser.getLastName(),
                    "dateOfBirth", updatedUser.getDateOfBirth(),
                    "gender", updatedUser.getGender(),
                    "height", updatedUser.getHeight(),
                    "weight", updatedUser.getWeight()
                )
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to update profile",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        try {
            // Get current user from authentication context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("GET /profile - Authentication: " + authentication);
            System.out.println("GET /profile - Authentication name: " + (authentication != null ? authentication.getName() : "null"));
            
            if (authentication == null || authentication.getName() == null || authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.badRequest().body("Authentication required");
            }
            
            String userEmail = authentication.getName();
            System.out.println("GET /profile - Looking for user with email: " + userEmail);
            
            // Find user by email
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                System.out.println("GET /profile - User not found for email: " + userEmail);
                return ResponseEntity.badRequest().body("User not found");
            }

            User user = userOpt.get();
            
            return ResponseEntity.ok(Map.of(
                "user", Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "dateOfBirth", user.getDateOfBirth(),
                    "gender", user.getGender(),
                    "height", user.getHeight(),
                    "weight", user.getWeight()
                )
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to get profile",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuth() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("Test auth endpoint - Authentication: " + authentication);
            System.out.println("Test auth endpoint - Authentication name: " + (authentication != null ? authentication.getName() : "null"));
            
            return ResponseEntity.ok(Map.of(
                "message", "Auth test successful",
                "authentication", authentication != null ? authentication.getName() : "null",
                "isAuthenticated", authentication != null && !authentication.getName().equals("anonymousUser")
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Auth test failed",
                "message", e.getMessage()
            ));
        }
    }
}
