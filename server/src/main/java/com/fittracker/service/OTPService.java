package com.fittracker.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OTPService {
    private Map<String, String> otpStore = new HashMap<>();

    public void sendOtp(String email) {
        String otp = String.valueOf(new Random().nextInt(899999) + 100000);
        otpStore.put(email, otp);
        System.out.println("OTP for " + email + ": " + otp); // Replace with email/SMS service
    }

    public boolean verifyOtp(String email, String otp) {
        return otp.equals(otpStore.get(email));
    }
}
