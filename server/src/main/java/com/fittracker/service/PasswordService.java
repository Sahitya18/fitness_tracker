package com.fittracker.service;

import com.fittracker.dto.ForgotPasswordRequest;
import com.fittracker.dto.ResetPasswordRequest;
import com.fittracker.model.PasswordResetToken;
import com.fittracker.model.User;
import com.fittracker.repository.PasswordResetTokenRepository;
import com.fittracker.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordService {
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordResetTokenRepository tokenRepository;
    @Autowired private JavaMailSender mailSender;
    @Autowired private PasswordEncoder passwordEncoder;

    @Value("${app.reset-password.base-url:http://localhost:8080}")
    private String baseUrl;

    public void createAndSendResetToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return;
        User user = userOpt.get();
        // Invalidate old tokens
        tokenRepository.findByUserAndUsedIsFalse(user).ifPresent(token -> {
            token.setUsed(true);
            tokenRepository.save(token);
        });
        // Create new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(token);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        resetToken.setUsed(false);
        tokenRepository.save(resetToken);
        // Send email
        String link = baseUrl + "/reset-password?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset Request");
        message.setText("Click the link to reset your password: " + link);
        mailSender.send(message);
    }

    public boolean validateResetToken(String token) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) return false;
        PasswordResetToken resetToken = tokenOpt.get();
        return !resetToken.isUsed() && resetToken.getExpiryDate().isAfter(LocalDateTime.now());
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) return false;
        PasswordResetToken resetToken = tokenOpt.get();
        if (resetToken.isUsed() || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) return false;
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword)); // Hash with BCrypt
        userRepository.save(user);
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
        return true;
    }
}
