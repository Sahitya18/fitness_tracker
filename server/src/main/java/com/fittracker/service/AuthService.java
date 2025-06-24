package com.fittracker.service;
import com.fittracker.dto.ForgotPasswordRequest;
import com.fittracker.dto.LoginRequest;
import com.fittracker.dto.RegisterRequest;

import com.fittracker.model.User;
import com.fittracker.repository.UserRepository;
import com.fittracker.util.PasswordEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    UserRepository repo;
    @Autowired OTPService otpService;

    public ResponseEntity<?> register(RegisterRequest req) {
        if (!otpService.verifyOtp(req.getEmail(), req.getOtp()))
            return ResponseEntity.status(403).body("Invalid OTP");

        User user = new User();
        user.setEmail(req.getEmail());
        user.setMobile(req.getMobile());
        user.setPasswordHash(PasswordEncryptor.hash(req.getPassword()));
        user.setVerified(true);
        repo.save(user);
        return ResponseEntity.ok("Registered");
    }

    public ResponseEntity<?> sendOtp(RegisterRequest req) {
        otpService.sendOtp(req.getEmail()); // implement SMS/email
        return ResponseEntity.ok("OTP sent");
    }

    public ResponseEntity<?> login(LoginRequest req) {
        Optional<User> u = repo.findByEmail(req.getEmail());
        if (u.isPresent() && PasswordEncryptor.matches(req.getPassword(), u.get().getPasswordHash()))
            return ResponseEntity.ok("Login success");
        return ResponseEntity.status(401).body("Login failed");
    }

    public ResponseEntity<?> forgotPassword(ForgotPasswordRequest req) {
        if (!otpService.verifyOtp(req.getEmail(), req.getOtp()))
            return ResponseEntity.status(403).body("Invalid OTP");

        User user = repo.findByEmail(req.getEmail()).orElseThrow();
        user.setPasswordHash(PasswordEncryptor.hash(req.getNewPassword()));
        repo.save(user);
        return ResponseEntity.ok("Password reset");
    }
}
