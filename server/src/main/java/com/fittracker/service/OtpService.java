package com.fittracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> verifiedEmails = new ConcurrentHashMap<>();
    private final Random rnd = new Random();
    private static final long OTP_VALIDITY_MINUTES = 10;

    @Autowired
    private JavaMailSender mailSender;

    private static class OtpData {
        String otp;
        LocalDateTime expiryTime;

        OtpData(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    public void generateAndSendOtp(String target) {
        String otp = String.format("%06d", rnd.nextInt(1_000_000));
        otpStore.put(target, new OtpData(
            otp,
            LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES)
        ));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(target);
        message.setSubject("Your One-Time Password (OTP)");
        message.setText(
            "Hello,\n\n" +
            "Your OTP code is: " + otp + "\n\n" +
            "This code will expire in 10 minutes.\n\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "Thank you,\nFitTrack Team"
        );
        message.setFrom("no-reply@fittrack.com");

        mailSender.send(message);
    }

    public boolean verifyOtp(String target, String otp) {
        OtpData otpData = otpStore.get(target);
        if (otpData == null) {
            return false;
        }

        // Check if OTP is expired
        if (LocalDateTime.now().isAfter(otpData.expiryTime)) {
            otpStore.remove(target);
            return false;
        }

        // Verify OTP
        if (otp.equals(otpData.otp)) {
            // Store verification status with new 10-minute expiry
            verifiedEmails.put(target, LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES));
            // Remove the OTP as it's no longer needed
            otpStore.remove(target);
            return true;
        }

        return false;
    }

    public boolean isEmailVerified(String email) {
        LocalDateTime verificationExpiry = verifiedEmails.get(email);
        if (verificationExpiry == null) {
            return false;
        }

        // Check if verification is still valid
        if (LocalDateTime.now().isAfter(verificationExpiry)) {
            verifiedEmails.remove(email);
            return false;
        }

        return true;
    }
}
