package com.fittracker.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    private final Map<String,String> store = new ConcurrentHashMap<>();
    private final Random rnd = new Random();

    public void generateAndSendOtp(String target) {
        String otp = String.format("%06d", rnd.nextInt(1_000_000));
        store.put(target, otp);
        // integrate with email/SMS here
        System.out.println("OTP for " + target + ": " + otp);
    }

    public boolean verifyOtp(String target, String otp) {
        return otp != null && otp.equals(store.get(target));
    }
}
