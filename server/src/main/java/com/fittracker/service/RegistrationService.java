package com.fittracker.service;


import com.fittracker.dto.RegisterRequest;
import com.fittracker.model.User;
import com.fittracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

public class RegistrationService {

    @Autowired private UserRepository userRepo;
    @Autowired
    private OtpService otpService;
    @Autowired private PasswordEncoder encoder;

    public ResponseEntity<?> registerUser(RegisterRequest req) {
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
}
