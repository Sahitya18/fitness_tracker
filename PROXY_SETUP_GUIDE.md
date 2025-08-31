# Secure API Proxy Setup Guide

This guide provides multiple approaches to securely integrate external APIs without exposing API keys in client-side code or URLs.

## 🚀 Quick Start (Option 1 - Recommended)

### 1. Environment Setup

Create a `.env` file in your server directory:

```bash
# API Configuration
FITNESS_API_KEY=your_actual_api_key_here
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret
OAUTH_TOKEN_URL=https://oauth.fitness-service.com/token
OAUTH_REFRESH_TOKEN=your_refresh_token

# Server Configuration
SERVER_PORT=8080
```

### 2. Update application.properties

Replace the placeholder values in `server/src/main/resources/application.properties`:

```properties
# External API proxy settings
proxy.services.fitness-api.base-url=https://api.fitness-service.com
proxy.services.fitness-api.api-key=${FITNESS_API_KEY}

# OAuth 2.0 Configuration
oauth2.fitness-api.client-id=${OAUTH_CLIENT_ID}
oauth2.fitness-api.client-secret=${OAUTH_CLIENT_SECRET}
oauth2.fitness-api.token-url=${OAUTH_TOKEN_URL}
oauth2.fitness-api.refresh-token=${OAUTH_REFRESH_TOKEN}
```

### 3. Usage Examples

#### From React Native Client:

```javascript
import ProxyClient from './utils/ProxyClient';

// GET request
const userData = await ProxyClient.get('fitness-api', 'users/profile', {
  userId: '123'
});

// POST request
const result = await ProxyClient.post('fitness-api', 'workouts', {
  type: 'cardio',
  duration: 30,
  calories: 250
});
```

#### Direct HTTP Request:

```bash
# GET request
curl -X GET "http://localhost:8080/api/proxy/fitness-api/users/profile?userId=123" \
  -H "Authorization: Bearer your_jwt_token"

# POST request
curl -X POST "http://localhost:8080/api/proxy/fitness-api/workouts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{"type":"cardio","duration":30,"calories":250}'
```

## 🔒 Security Features

### 1. API Key Protection
- ✅ API keys stored server-side only
- ✅ Never exposed in URLs or client code
- ✅ Environment variable encryption
- ✅ Automatic token refresh

### 2. Rate Limiting
- ✅ Per-IP rate limiting (60 requests/minute)
- ✅ Configurable limits per service
- ✅ Automatic cleanup of old entries

### 3. Request Validation
- ✅ Service name validation
- ✅ Sensitive header filtering
- ✅ CORS configuration
- ✅ Authentication required

### 4. OAuth 2.0 Integration
- ✅ Automatic token refresh
- ✅ Secure token storage
- ✅ Expiration handling
- ✅ Error recovery

## 🌐 IP Address Solutions

### Option A: Dynamic DNS (Recommended for Development)

1. **Use a Dynamic DNS Service:**
   - No-IP, DynDNS, or DuckDNS
   - Update your IP automatically
   - Provide a fixed hostname to API provider

2. **Setup Script:**
```bash
#!/bin/bash
# Update your dynamic DNS
curl "https://your-dyndns-service.com/update?hostname=yourhostname&ip=$(curl -s ifconfig.me)"
```

### Option B: VPN with Static IP

1. **Use a VPN Service:**
   - NordVPN, ExpressVPN, or similar
   - Many provide static IP options
   - More secure than dynamic DNS

### Option C: Cloud Hosting (Production)

1. **Deploy to Cloud:**
   - AWS, Google Cloud, or Azure
   - Get a static IP address
   - More reliable for production

## 🔧 Advanced Configuration

### Custom Service Configuration

Add new services in `application.properties`:

```properties
# Add new service
proxy.services.new-api.base-url=https://api.newservice.com
proxy.services.new-api.api-key=${NEW_API_KEY}

oauth2.new-api.client-id=${NEW_OAUTH_CLIENT_ID}
oauth2.new-api.client-secret=${NEW_OAUTH_CLIENT_SECRET}
oauth2.new-api.token-url=${NEW_OAUTH_TOKEN_URL}
oauth2.new-api.refresh-token=${NEW_OAUTH_REFRESH_TOKEN}
```

Update `ProxyService.java`:

```java
private String getBaseUrl(String serviceName) {
    switch (serviceName.toLowerCase()) {
        case "fitness-api":
            return fitnessApiBaseUrl;
        case "new-api":
            return newApiBaseUrl; // Add this
        default:
            throw new IllegalArgumentException("Unknown service: " + serviceName);
    }
}
```

### Custom Rate Limiting

Modify rate limits in `application.properties`:

```properties
# Per-service rate limiting
proxy.rate-limit.fitness-api.max-requests=200
proxy.rate-limit.fitness-api.window-minutes=5
```

## 🛡️ Additional Security Measures

### 1. Environment Variable Encryption

Use Spring Cloud Config or HashiCorp Vault:

```properties
# Encrypted properties
proxy.services.fitness-api.api-key=ENC(encrypted_api_key_here)
```

### 2. Request Logging

Add logging to track API usage:

```java
@Slf4j
public class ProxyService {
    public ResponseEntity<?> forwardRequest(...) {
        log.info("Proxy request: {} {} from IP: {}", method, servicePath, clientIp);
        // ... existing code
    }
}
```

### 3. IP Whitelisting

Add IP validation in `ProxyService`:

```java
private static final Set<String> ALLOWED_IPS = Set.of(
    "192.168.1.0/24",  // Local network
    "10.0.0.0/8"       // VPN range
);

private boolean isIpAllowed(String clientIp) {
    // Implement IP range checking
    return ALLOWED_IPS.stream().anyMatch(range -> 
        isIpInRange(clientIp, range));
}
```

### 4. Request Signing

Add request signature validation:

```java
private boolean validateRequestSignature(HttpServletRequest request) {
    String signature = request.getHeader("X-Request-Signature");
    String timestamp = request.getHeader("X-Request-Timestamp");
    
    // Validate signature and timestamp
    return isValidSignature(signature, timestamp, request.getBody());
}
```

## 🚨 Troubleshooting

### Common Issues:

1. **Rate Limit Exceeded:**
   - Check your request frequency
   - Increase limits if needed
   - Implement caching

2. **OAuth Token Expired:**
   - Check refresh token validity
   - Verify OAuth configuration
   - Check network connectivity

3. **IP Address Issues:**
   - Update your dynamic DNS
   - Contact API provider for IP whitelist
   - Use VPN with static IP

### Debug Mode:

Enable debug logging in `application.properties`:

```properties
logging.level.com.fittracker.service.ProxyService=DEBUG
logging.level.com.fittracker.service.OAuth2Service=DEBUG
```

## 📊 Monitoring

### Health Check Endpoint:

```bash
curl http://localhost:8080/api/proxy/health
```

### Metrics (Optional):

Add Spring Boot Actuator for metrics:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

## 🔄 Alternative Solutions

### Option 2: Microservice Architecture
- Separate proxy service
- Better for high-traffic scenarios
- More scalable

### Option 3: API Gateway
- Use Kong, AWS API Gateway, or similar
- More features but more complex
- Better for enterprise use

## 📝 Best Practices

1. **Never store API keys in code**
2. **Use environment variables for secrets**
3. **Implement proper error handling**
4. **Monitor API usage and costs**
5. **Regular security audits**
6. **Keep dependencies updated**
7. **Use HTTPS in production**
8. **Implement proper logging**

## 🆘 Support

For issues or questions:
1. Check the logs for error messages
2. Verify environment variables
3. Test with the health check endpoint
4. Review the security configuration
