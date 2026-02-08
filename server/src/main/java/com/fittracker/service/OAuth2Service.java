package com.fittracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class OAuth2Service {

    @Autowired
    private WebClient webClient;

    @Value("${proxy.services.fitness-api.base-url}")
    private String fitnessApiBaseUrl;

    @Value("${proxy.services.fitness-api.api-key}")
    private String apiKey;

    /**
     * Get access token for the fitness API
     */
    public String getAccessToken() {
        // The WebClient is already configured with OAuth2
        // You can access the token through the client
        return "Bearer token will be automatically added by WebClient";
    }

    /**
     * Make an authenticated API call to the fitness service
     */
    public Mono<Map> callFitnessApi(String endpoint, Object requestBody) {
        return webClient.post()
                .uri(fitnessApiBaseUrl + endpoint)
                .header("X-API-Key", apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class);
    }

    /**
     * Get data from fitness API
     */
    public Mono<Map> getFitnessData(String endpoint) {
        return webClient.get()
                .uri(fitnessApiBaseUrl + endpoint)
                .header("X-API-Key", apiKey)
                .retrieve()
                .bodyToMono(Map.class);
    }

    /**
     * Search for food items in the fitness API
     */
    public Mono<Map> searchFood(String query) {
        return webClient.get()
                .uri(fitnessApiBaseUrl + "/food/search?query=" + query)
                .header("X-API-Key", apiKey)
                .retrieve()
                .bodyToMono(Map.class);
    }

    /**
     * Get nutritional information for a food item
     */
    public Mono<Map> getNutritionalInfo(String foodId) {
        return webClient.get()
                .uri(fitnessApiBaseUrl + "/food/" + foodId + "/nutrition")
                .header("X-API-Key", apiKey)
                .retrieve()
                .bodyToMono(Map.class);
    }
}
