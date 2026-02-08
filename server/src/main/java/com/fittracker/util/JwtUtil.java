package com.fittracker.util;

import io.jsonwebtoken.security.Keys;
import java.security.Key;

public class JwtUtil {
    // Use a fixed secret key for consistency across the application
    // This must be at least 256 bits (32 bytes) for HS256
    private static final String SECRET_STRING = "my-super-secret-jwt-key-that-is-long-enough-for-hs256-algorithm-2024";
    private static final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET_STRING.getBytes());
    
    public static Key getSecretKey() {
        return SECRET_KEY;
    }
    
    // For debugging
    public static String getSecretString() {
        return SECRET_STRING;
    }
}
