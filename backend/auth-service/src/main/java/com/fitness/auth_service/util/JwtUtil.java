package com.fitness.auth_service.util;

import io.jsonwebtoken.security.Keys;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;


import java.security.Key;

public class JwtUtil {

    private static String SECRET_STRING="";
    @Value("${spring.jwt.secret.string}")
    public void setSecretString(String keyString){
        SECRET_STRING=keyString;
    }
    private static final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET_STRING.getBytes());

    public static Key getSecretKey() {
        return SECRET_KEY;
    }

    // For debugging
    public static String getSecretString() {
        return SECRET_STRING;
    }
}
