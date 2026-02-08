package com.fittracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ProxyService {

    private final RestTemplate restTemplate = new RestTemplate();
    
    @Autowired
    private OAuth2Service oauth2Service;
    
    // Rate limiting: track requests per IP
    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, Long> lastRequestTime = new ConcurrentHashMap<>();
    
    // Configuration for different services
    @Value("${proxy.services.fitness-api.base-url:}")
    private String fitnessApiBaseUrl;
    
    @Value("${proxy.services.fitness-api.api-key:}")
    private String fitnessApiKey;
    
    @Value("${proxy.rate-limit.max-requests:100}")
    private int maxRequestsPerMinute;
    
    @Value("${proxy.rate-limit.window-minutes:1}")
    private int rateLimitWindowMinutes;

    public ResponseEntity<?> forwardRequest(String serviceName, String servicePath, 
                                         HttpMethod method, String body, 
                                         Map<String, String> queryParams, 
                                         Map<String, String> headers) {
        
        // Rate limiting check
        String clientIp = getClientIp();
        if (!checkRateLimit(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Rate limit exceeded"));
        }
        
        // Validate service name
        if (!isValidService(serviceName)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid service name: " + serviceName));
        }
        
        try {
            // Build the target URL
            String targetUrl = buildTargetUrl(serviceName, servicePath, queryParams);
            
            // Prepare headers
            HttpHeaders httpHeaders = prepareHeaders(serviceName, headers);
            
            // Create request entity
            HttpEntity<String> requestEntity = new HttpEntity<>(body, httpHeaders);
            
            // Forward the request
            ResponseEntity<String> response = restTemplate.exchange(
                    targetUrl, method, requestEntity, String.class);
            
            return ResponseEntity.status(response.getStatusCode())
                    .headers(response.getHeaders())
                    .body(response.getBody());
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "External service error: " + e.getMessage()));
        }
    }
    
    private String buildTargetUrl(String serviceName, String servicePath, Map<String, String> queryParams) {
        String baseUrl = getBaseUrl(serviceName);
        String fullUrl = baseUrl + "/" + servicePath;
        
        // Add query parameters
        if (!queryParams.isEmpty()) {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(fullUrl);
            queryParams.forEach(builder::queryParam);
            return builder.toUriString();
        }
        
        return fullUrl;
    }
    
    private HttpHeaders prepareHeaders(String serviceName, Map<String, String> headers) {
        HttpHeaders httpHeaders = new HttpHeaders();
        
        // Copy original headers (excluding sensitive ones)
        headers.forEach((key, value) -> {
            if (!isSensitiveHeader(key)) {
                httpHeaders.add(key, value);
            }
        });
        
        // Add service-specific headers
        addServiceHeaders(serviceName, httpHeaders);
        
        return httpHeaders;
    }
    
    private void addServiceHeaders(String serviceName, HttpHeaders headers) {
        switch (serviceName.toLowerCase()) {
            case "fitness-api":
                if (fitnessApiKey != null && !fitnessApiKey.isEmpty()) {
                    headers.add("X-API-Key", fitnessApiKey);
                }
                // OAuth token will be automatically added by WebClient in OAuth2Service
                // No need to manually add it here
                break;
            // Add more services as needed
        }
    }
    
    private String getBaseUrl(String serviceName) {
        switch (serviceName.toLowerCase()) {
            case "fitness-api":
                return fitnessApiBaseUrl;
            default:
                throw new IllegalArgumentException("Unknown service: " + serviceName);
        }
    }
    
    private boolean isValidService(String serviceName) {
        return "fitness-api".equalsIgnoreCase(serviceName);
        // Add more valid services as needed
    }
    
    private boolean isSensitiveHeader(String headerName) {
        String lowerHeader = headerName.toLowerCase();
        return lowerHeader.contains("authorization") || 
               lowerHeader.contains("cookie") || 
               lowerHeader.contains("host") ||
               lowerHeader.contains("content-length");
    }
    
    private boolean checkRateLimit(String clientIp) {
        long currentTime = System.currentTimeMillis();
        long windowStart = currentTime - (rateLimitWindowMinutes * 60 * 1000);
        
        // Clean old entries
        lastRequestTime.entrySet().removeIf(entry -> entry.getValue() < windowStart);
        
        AtomicInteger count = requestCounts.computeIfAbsent(clientIp, k -> new AtomicInteger(0));
        lastRequestTime.put(clientIp, currentTime);
        
        return count.incrementAndGet() <= maxRequestsPerMinute;
    }
    
    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                
                // Check for forwarded headers (common with proxies/load balancers)
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                
                String xRealIp = request.getHeader("X-Real-IP");
                if (xRealIp != null && !xRealIp.isEmpty()) {
                    return xRealIp;
                }
                
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            // Log error if needed
        }
        return "unknown";
    }
}
