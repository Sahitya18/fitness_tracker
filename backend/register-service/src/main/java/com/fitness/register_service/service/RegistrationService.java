package com.fitness.register_service.service;

import com.fitness.register_service.dto.RegisterRequest;
import com.fitness.register_service.model.User;
import com.fitness.register_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class RegistrationService {
    @Autowired
    private UserRepository userRepo;
//    @Autowired
//    private OtpService otpService;
    @Autowired
    private PasswordEncoder encoder;

    @Transactional
    public ResponseEntity<?> registerUser(RegisterRequest req) {
        // Check if email is verified
//        if (!otpService.isEmailVerified(req.getEmail())) {
//            Map<String, String> error = new HashMap<>();
//            error.put("error", "Email verification required or has expired. Please verify your email first.");
//            return ResponseEntity.badRequest().body(error);
//        }

        // Check if email already exists
        Optional<User> existingUser = userRepo.findByEmail(req.getEmail());
        if (existingUser.isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email already registered");
            return ResponseEntity.badRequest().body(error);
        }

        // Check if mobile already exists
        existingUser = userRepo.findByMobile(req.getMobile());
        if (existingUser.isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Mobile number already registered");
            return ResponseEntity.badRequest().body(error);
        }

        // Create new user
        User user = new User();
        user.setEmail(req.getEmail());
        user.setMobile(req.getMobile());
        String passHash=encoder.encode(req.getPassword());
        System.out.println("password: "+passHash);
        user.setPasswordHash(passHash);

        userRepo.save(user);
        return ResponseEntity.ok().body("User registered successfully");
    }
}
