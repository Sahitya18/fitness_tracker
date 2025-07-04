package com.fittracker.service;
import com.fittracker.dto.ForgotPasswordRequest;
import com.fittracker.dto.LoginRequest;
import com.fittracker.dto.LoginResponse;
import com.fittracker.dto.RegisterRequest;

import com.fittracker.model.User;
import com.fittracker.repository.UserRepository;
import com.fittracker.util.PasswordEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.util.Optional;

@Service
public class AuthService {
    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder encoder;
    
    private static final byte[] SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256).getEncoded();
    private static final long TOKEN_VALIDITY = 24 * 60 * 60 * 1000; // 24 hours

    public ResponseEntity<?> login(LoginRequest req) {
        // Validate input
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        if (req.getPassword() == null || req.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required");
        }
        // Find user
        Optional<User> userOpt = userRepo.findByEmail(req.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid email or password");
        }

        // Verify password
        User user = userOpt.get();
        System.out.println("password matches:: "+user +" "+(encoder.matches(req.getPassword(), user.getPasswordHash())));
        if (!encoder.matches(req.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().body("Invalid email or password");
        }

        // Generate JWT token
        String token = Jwts.builder()
            .setSubject(user.getEmail())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY))
            .signWith(Keys.hmacShaKeyFor(SECRET_KEY))
            .compact();

        // Create response
        LoginResponse response = new LoginResponse();
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
