package com.fittracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = Map.of(
            "status", "UP",
            "timestamp", LocalDateTime.now().toString(),
            "service", "FitTracker API",
            "version", "1.0.0",
            "message", "Server is running and accessible via DuckDNS"
        );
        return ResponseEntity.ok(health);
    }

    @GetMapping("/proxy")
    public ResponseEntity<Map<String, Object>> proxyHealthCheck() {
        Map<String, Object> health = Map.of(
            "status", "UP",
            "timestamp", LocalDateTime.now().toString(),
            "service", "FitTracker Proxy",
            "message", "Proxy endpoint is working",
            "duckdns", "fitmee.duckdns.org"
        );
        return ResponseEntity.ok(health);
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
