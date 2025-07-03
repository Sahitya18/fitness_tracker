package com.fittracker.service;

import com.fittracker.dto.RegisterRequest;
import com.fittracker.model.User;
import com.fittracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class RegistrationService {

    @Autowired private UserRepository userRepo;
    @Autowired private OtpService otpService;
    @Autowired private PasswordEncoder encoder;

    @Transactional
    public ResponseEntity<?> registerUser(RegisterRequest req) {
        // Check if email is verified
        if (!otpService.isEmailVerified(req.getEmail())) {
            return ResponseEntity.badRequest().body("Email verification required or has expired. Please verify your email first.");
        }

        // Check if email already exists
        Optional<User> existingUser = userRepo.findByEmail(req.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        // Check if mobile already exists
        existingUser = userRepo.findByMobile(req.getMobile());
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body("Mobile number already registered");
        }

        // Create new user
        User user = new User();
        user.setEmail(req.getEmail());
        user.setMobile(req.getMobile());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        
        // Set profile fields if provided
        if (req.getFirstName() != null) user.setFirstName(req.getFirstName());
        if (req.getLastName() != null) user.setLastName(req.getLastName());
        if (req.getDateOfBirth() != null) user.setDateOfBirth(req.getDateOfBirth());
        if (req.getGender() != null) user.setGender(req.getGender());
        if (req.getHeight() != null) user.setHeight(req.getHeight());
        if (req.getWeight() != null) user.setWeight(req.getWeight());

        userRepo.save(user);
        return ResponseEntity.ok().body("User registered successfully");
    }

    public ResponseEntity<?> completeUserProfile(RegisterRequest req) {
        try {
            Optional<User> userOpt = userRepo.findByEmail(req.getEmail());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User user = userOpt.get();
            // Update user profile fields
            user.setFirstName(req.getFirstName());
            user.setLastName(req.getLastName());
            user.setDateOfBirth(req.getDateOfBirth());
            user.setGender(req.getGender());
            user.setHeight(req.getHeight());
            user.setWeight(req.getWeight());
            
            userRepo.save(user);
            return ResponseEntity.ok("Profile completed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
