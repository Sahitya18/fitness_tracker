package com.fittracker.controller;

import com.fittracker.service.ProxyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.HandlerMapping;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/proxy")
public class ProxyController {

    @Autowired
    private ProxyService proxyService;

    /**
     * Generic proxy endpoint that forwards requests to external APIs
     * Usage: POST /api/proxy/external-service-name
     */
    @RequestMapping(value = "/{serviceName}/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<?> proxyRequest(
            @PathVariable String serviceName,
            @RequestBody(required = false) String body,
            @RequestParam Map<String, String> queryParams,
            HttpServletRequest request,
            @RequestHeader Map<String, String> headers) {
        
        try {
            // Remove proxy-specific headers
            headers.remove("host");
            headers.remove("content-length");
            
            // Get the path after the service name
            String path = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
            String servicePath = path.substring(path.indexOf(serviceName) + serviceName.length() + 1);
            
            HttpMethod method = HttpMethod.valueOf(request.getMethod());
            
            return proxyService.forwardRequest(serviceName, servicePath, method, body, queryParams, headers);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Proxy request failed: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint for the proxy service
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "Proxy service is running"));
    }
}
