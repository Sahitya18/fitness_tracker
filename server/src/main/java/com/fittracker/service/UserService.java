package com.fittracker.service;

import com.fittracker.model.User;
import com.fittracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public User updateUserProfile(Long userId, Map<String, Object> updates) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        // Update fields based on the provided updates
        if (updates.containsKey("name")) {
            String fullName = (String) updates.get("name");
            String[] nameParts = fullName.split(" ", 2);
            user.setFirstName(nameParts[0]);
            user.setLastName(nameParts.length > 1 ? nameParts[1] : "");
        }

        if (updates.containsKey("dateOfBirth")) {
            String dateStr = (String) updates.get("dateOfBirth");
            try {
                // Parse date in format "January 15, 1990"
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
                LocalDate dateOfBirth = LocalDate.parse(dateStr, formatter);
                user.setDateOfBirth(dateOfBirth);
            } catch (Exception e) {
                throw new RuntimeException("Invalid date format. Expected format: 'January 15, 1990'");
            }
        }

        if (updates.containsKey("gender")) {
            user.setGender((String) updates.get("gender"));
        }

        if (updates.containsKey("weight")) {
            String weightStr = (String) updates.get("weight");
            try {
                // Extract numeric value from "75 kg" format
                String numericPart = weightStr.replaceAll("[^0-9.]", "");
                user.setWeight(Double.parseDouble(numericPart));
            } catch (Exception e) {
                throw new RuntimeException("Invalid weight format");
            }
        }

        if (updates.containsKey("targetWeight")) {
            String targetWeightStr = (String) updates.get("targetWeight");
            try {
                // Extract numeric value from "70 kg" format
                String numericPart = targetWeightStr.replaceAll("[^0-9.]", "");
                // Note: We need to add a targetWeight field to the User model
                // For now, we'll store it in a different way or skip it
                System.out.println("Target weight update requested: " + numericPart);
            } catch (Exception e) {
                throw new RuntimeException("Invalid target weight format");
            }
        }

        if (updates.containsKey("height")) {
            String heightStr = (String) updates.get("height");
            try {
                // Extract numeric value from "175 cm" format
                String numericPart = heightStr.replaceAll("[^0-9.]", "");
                user.setHeight(Double.parseDouble(numericPart));
            } catch (Exception e) {
                throw new RuntimeException("Invalid height format");
            }
        }

        // Save and return updated user
        return userRepository.save(user);
    }

    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
