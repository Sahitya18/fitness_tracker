package com.fitness.auth_service.service;

import com.fitness.auth_service.dto.LoginRequest;
import com.fitness.auth_service.dto.LoginResponse;
import com.fitness.auth_service.model.User;
import com.fitness.auth_service.repository.UserRepository;
import com.fitness.auth_service.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class AuthService {

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private PasswordEncoder encoder;

    private static final long TOKEN_VALIDITY = 24 * 60 * 60 * 1000; // 24 hours


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

        // Generate JWT token
        System.out.println("Generating JWT token for user: " + user.getEmail());
        System.out.println("Using secret key: " + JwtUtil.getSecretString().substring(0, 20) + "...");

        String token = Jwts.builder()
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY))
                .signWith(JwtUtil.getSecretKey())
                .compact();
//
//        System.out.println("Generated token: " + token.substring(0, 20) + "...");

        // Create response
        LoginResponse response = new LoginResponse();
        response.setId(user.getId());
        response.setToken(token);
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
}
