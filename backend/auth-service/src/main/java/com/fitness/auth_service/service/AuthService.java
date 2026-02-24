package com.fitness.auth_service.service;

import com.fitness.auth_service.dto.LoginRequest;
import com.fitness.auth_service.dto.LoginResponse;
import com.fitness.auth_service.dto.UserProfileResponse;
import com.fitness.auth_service.model.User;
import com.fitness.auth_service.repository.UserRepository;
import com.fitness.auth_service.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private PasswordEncoder encoder;

    private final JwtUtil jwtUtil;

    public AuthService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public ResponseEntity<?> login(LoginRequest req) {
        // Validate input
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email is required");
            return ResponseEntity.badRequest().body(error);
        }
        if (req.getPassword() == null || req.getPassword().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Password is required");
            return ResponseEntity.badRequest().body(error);
        }

        Optional<User> userOpt = userRepo.findByEmail(req.getEmail());
        if (userOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid email or password");
            return ResponseEntity.badRequest().body(error);
        }

        // Verify password
        User user = userOpt.get();
        System.out.println("password matches:: "+user +" "+(encoder.matches(req.getPassword(), user.getPasswordHash())));
        if (!encoder.matches(req.getPassword(), user.getPasswordHash())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid email or password");
            return ResponseEntity.badRequest().body(error);
        }

        // Create response
        LoginResponse response = new LoginResponse();
        response.setId(user.getId());
        response.setToken(jwtUtil.generateToken(req.getEmail()));
        response.setEmail(user.getEmail());
        response.setMobile(user.getMobile());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setGender(user.getGender());
        response.setHeight(user.getHeight());
        response.setWeight(user.getWeight());
        response.setMessage("Login successful");

        return ResponseEntity.ok(response);

    }

    public ResponseEntity<?> getUserProfile(String token) {
        try {
            // Extract email from token
            String email = jwtUtil.extractEmailFromToken(token);
            
            // Find user by email
            Optional<User> userOpt = userRepo.findByEmail(email);
            if (userOpt.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.badRequest().body(error);
            }

            User user = userOpt.get();
            
            // Build response
            UserProfileResponse response = new UserProfileResponse();
            response.setId(user.getId());
            response.setEmail(user.getEmail());
            response.setMobile(user.getMobile());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            
            // Combine first and last name for 'name' field
            String fullName = "";
            if (user.getFirstName() != null && !user.getFirstName().trim().isEmpty()) {
                fullName = user.getFirstName();
            }
            if (user.getLastName() != null && !user.getLastName().trim().isEmpty()) {
                fullName = fullName.isEmpty() ? user.getLastName() : fullName + " " + user.getLastName();
            }
            response.setName(fullName.isEmpty() ? null : fullName);
            
            response.setDateOfBirth(user.getDateOfBirth());
            response.setGender(user.getGender());
            response.setHeight(user.getHeight());
            response.setWeight(user.getWeight());
            
            // Additional fields (set to null if not in DB - frontend handles defaults)
            response.setTargetWeight(null);
            response.setFitnessGoal(null);
            response.setActivityLevel(null);
            response.setCurrentStreak(null);
            response.setTotalWorkouts(null);
            response.setCaloriesBurned(null);
            response.setWeightLost(null);
            response.setGoalProgress(null);
            response.setAvgDailyCalories(null);
            response.setWeeklyWorkouts(null);
            response.setWaterIntake(null);
            response.setSleepAverage(null);
            response.setStepsAverage(null);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "Failed to fetch user profile");
            return ResponseEntity.badRequest().body(error);
        }
    }
}
