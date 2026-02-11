package com.fitness.auth_service.controller;

import com.fitness.auth_service.dto.LoginRequest;
import com.fitness.auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        System.out.println("🔥 LOGIN API HIT: " + request.getEmail());
        try {
            return authService.login(request);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "Unknown error");
            return ResponseEntity.badRequest().body(error);
        }
    }

}
