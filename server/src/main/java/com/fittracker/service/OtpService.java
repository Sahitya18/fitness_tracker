package com.fittracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    private final Map<String,String> store = new ConcurrentHashMap<>();
    private final Random rnd = new Random();

    @Autowired
    private JavaMailSender mailSender;
    public void generateAndSendOtp(String target) {
        String otp = String.format("%06d", rnd.nextInt(1_000_000));
        store.put(target, otp);
        // integrate with email/SMS here
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

        // 3) Send the email
        mailSender.send(message);
        System.out.println("OTP for " + target + ": " + otp);
    }

    public boolean verifyOtp(String target, String otp) {
        return otp != null && otp.equals(store.get(target));
    }
}
