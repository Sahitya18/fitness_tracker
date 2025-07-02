package com.fittracker.service;

import com.fittracker.dto.RegisterRequest;
import com.fittracker.model.User;
import com.fittracker.repository.UserRepository;
import com.fittracker.service.OtpService;
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
        // Validate OTP for email only
        boolean emailOk = otpService.verifyOtp(req.getEmail(), req.getOtp());
        boolean mobileOk = otpService.verifyOtp(req.getMobile(), req.getOtp());
        if (!emailOk && !mobileOk)
            return ResponseEntity.badRequest().body("Invalid OTP");

        if (req.getPassword().length() < 6)
            return ResponseEntity.badRequest().body("Password must be ≥6 chars");

        if (userRepo.existsByEmail(req.getEmail()))
            return ResponseEntity.badRequest().body("Email registered");
        if (userRepo.existsByMobile(req.getMobile()))
            return ResponseEntity.badRequest().body("Mobile registered");

        User u = new User();
        u.setEmail(req.getEmail());
        u.setMobile(req.getMobile());
        u.setPasswordHash(encoder.encode(req.getPassword()));
        u.setEmailVerified(true);
        u.setMobileVerified(true);
        userRepo.save(u);
        return ResponseEntity.ok("Registered");
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
            user.setTargetWeight(req.getTargetWeight());
            user.setWeeklyGoal(req.getWeeklyGoal());
            user.setFitnessGoal(req.getFitnessGoal());
            user.setActivityLevel(req.getActivityLevel());
            user.setDietaryPreference(req.getDietaryPreference());
            user.setWorkoutPreference(req.getWorkoutPreference());
            
            userRepo.save(user);
            return ResponseEntity.ok("Profile completed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
