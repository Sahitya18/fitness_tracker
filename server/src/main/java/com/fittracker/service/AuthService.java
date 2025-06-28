package com.fittracker.service;
import com.fittracker.dto.ForgotPasswordRequest;
import com.fittracker.dto.LoginRequest;
import com.fittracker.dto.RegisterRequest;

import com.fittracker.model.User;
import com.fittracker.repository.UserRepository;
import com.fittracker.util.PasswordEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    @Autowired UserRepository userRepo;
    @Autowired PasswordEncoder encoder;

        public ResponseEntity<?> login(LoginRequest req) {
            User u = userRepo.findByEmail(req.getEmail());
            if (u == null || !encoder.matches(req.getPassword(), u.getPasswordHash()))
                return ResponseEntity.badRequest().body("Invalid credentials");
            return ResponseEntity.ok("Login successful");
        }
}
