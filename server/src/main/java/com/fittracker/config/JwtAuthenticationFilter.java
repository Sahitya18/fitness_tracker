package com.fittracker.config;

import com.fittracker.util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("Processing JWT token: " + token.substring(0, Math.min(20, token.length())) + "...");
            
            try {
                Claims claims = Jwts.parserBuilder()
                    .setSigningKey(JwtUtil.getSecretKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
                
                String email = claims.getSubject();
                System.out.println("Extracted email from token: " + email);
                
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Create a simple UserDetails object
                    UserDetails userDetails = org.springframework.security.core.userdetails.User
                        .withUsername(email)
                        .password("")
                        .authorities(new ArrayList<>())
                        .build();
                    
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("Authentication set for user: " + email);
                }
            } catch (Exception e) {
                // Token is invalid, but we'll continue the filter chain
                System.out.println("Invalid JWT token: " + e.getMessage());
                logger.warn("Invalid JWT token: " + e.getMessage());
            }
        } else {
            System.out.println("No Authorization header or not Bearer token");
        }
        
        filterChain.doFilter(request, response);
    }
}
