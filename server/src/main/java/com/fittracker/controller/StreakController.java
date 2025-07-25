package com.fittracker.controller;

import com.fittracker.model.User;
import com.fittracker.model.UserStreak;
import com.fittracker.service.StreakService;
import com.fittracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/streaks")
@CrossOrigin(origins = "*")
public class StreakController {
    @Autowired
    private StreakService streakService;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserStreak(@PathVariable Long userId) {
        try {
            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User ID is required");
                return ResponseEntity.badRequest().body(error);
            }
            UserStreak streak = streakService.getUserStreak(userId);
            if (streak == null) {
                // If no streak exists, return default values
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(new UserStreak(user));
            }
            return ResponseEntity.ok(streak);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error fetching streak: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/record/{userId}")
    public ResponseEntity<?> recordActivity(@PathVariable Long userId) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            UserStreak streak = streakService.recordActivity(userId);
            return ResponseEntity.ok(streak);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error recording activity: " + e.getMessage());
        }
    }
} 