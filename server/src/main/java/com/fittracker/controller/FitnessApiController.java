package com.fittracker.controller;

import com.fittracker.service.OAuth2Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/fitness")
@CrossOrigin(origins = "*")
public class FitnessApiController {

    @Autowired
    private OAuth2Service oAuth2Service;

    /**
     * Search for food items in the external fitness API
     */
    @GetMapping("/search")
    public Mono<ResponseEntity<Map>> searchFood(@RequestParam String query) {
        return oAuth2Service.searchFood(query)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    /**
     * Get nutritional information for a specific food item
     */
    @GetMapping("/food/{foodId}/nutrition")
    public Mono<ResponseEntity<Map>> getNutritionalInfo(@PathVariable String foodId) {
        return oAuth2Service.getNutritionalInfo(foodId)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    /**
     * Get access token status
     */
    @GetMapping("/token")
    public ResponseEntity<Map<String, String>> getTokenStatus() {
        String token = oAuth2Service.getAccessToken();
        return ResponseEntity.ok(Map.of("status", "Token available", "message", token));
    }

    /**
     * Make a custom API call to the fitness service
     */
    @PostMapping("/custom")
    public Mono<ResponseEntity<Map>> customApiCall(
            @RequestParam String endpoint,
            @RequestBody(required = false) Map<String, Object> requestBody) {
        
        if (requestBody != null) {
            return oAuth2Service.callFitnessApi(endpoint, requestBody)
                    .map(ResponseEntity::ok)
                    .onErrorReturn(ResponseEntity.internalServerError().build());
        } else {
            return oAuth2Service.getFitnessData(endpoint)
                    .map(ResponseEntity::ok)
                    .onErrorReturn(ResponseEntity.internalServerError().build());
        }
    }
}
