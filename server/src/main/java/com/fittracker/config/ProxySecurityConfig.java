package com.fittracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class ProxySecurityConfig {

    @Bean
    public SecurityFilterChain proxyFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/proxy/**") // Apply only to proxy endpoints
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/proxy/health").permitAll() // Health check endpoint
                .requestMatchers("/api/proxy/**").authenticated() // All other proxy endpoints require auth
            )
            .csrf(csrf -> csrf.disable()) // Disable CSRF for API endpoints
            .cors(cors -> cors.configurationSource(proxyCorsConfigurationSource()))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(new ProxyRateLimitFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource proxyCorsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*")); // Configure as needed
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/proxy/**", configuration);
        return source;
    }
}
