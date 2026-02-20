package com.fitness.register_service.service;

import com.fitness.register_service.dto.UpdateRequest;
import com.fitness.register_service.dto.UpdateProfileRequest;
import com.fitness.register_service.repository.updateUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;

@Service
public class UpdateService {

    @Autowired
    private updateUserDetails updateUserDetailsRepository;

    @Transactional
    public ResponseEntity<?> updateUser(UpdateRequest request){
        String emailId = request.getKeyValuePairList().get(0).value.toString();
        String field = request.getKeyValuePairList().get(1).key;
        String fieldValue = request.getKeyValuePairList().get(1).value.toString();

        int updated = updateUserDetailsRepository.updateUserFieldByEmail(emailId, field, fieldValue);

        if (updated == 0) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not found or field not updated");
            return ResponseEntity.badRequest().body(error);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "User updated successfully");
        return ResponseEntity.ok(response);
    }

    @Transactional
    public ResponseEntity<?> updateUserProfile(UpdateProfileRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email is required");
            return ResponseEntity.badRequest().body(error);
        }
        if (request.getField() == null || request.getField().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Field is required");
            return ResponseEntity.badRequest().body(error);
        }
        if (request.getValue() == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Value is required");
            return ResponseEntity.badRequest().body(error);
        }

        // Map frontend field names to database column names
        String dbField = mapFieldToDbColumn(request.getField());
        if (dbField == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid field: " + request.getField());
            return ResponseEntity.badRequest().body(error);
        }

        // Format value based on field type
        String fieldValue = formatFieldValue(request.getField(), request.getValue().toString(), dbField);

        int updated = updateUserDetailsRepository.updateUserFieldByEmail(
                request.getEmail(),
                dbField,
                fieldValue
        );

        if (updated == 0) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not found or field not updated");
            return ResponseEntity.badRequest().body(error);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Profile updated successfully");
        return ResponseEntity.ok(response);
    }

    private String mapFieldToDbColumn(String field) {
        // Map frontend field names to database column names
        if (field == null) return null;
        
        return switch (field.toLowerCase()) {
            case "name" -> "first_name"; // For name, we'll update first_name (or could split)
            case "firstname" -> "first_name";
            case "lastname" -> "last_name";
            case "mobile" -> "mobile";
            case "dateofbirth" -> "date_of_birth";
            case "date_of_birth" -> "date_of_birth";
            case "gender" -> "gender";
            case "weight" -> "weight";
            case "height" -> "height";
            case "targetweight" -> null; // Not in users table
            case "fitnessgoal" -> null; // Not in users table
            case "activitylevel" -> null; // Not in users table
            default -> null;
        };
    }

    private String formatFieldValue(String frontendField, String value, String dbField) {
        // Handle date formatting
        if ("date_of_birth".equals(dbField)) {
            try {
                // Try parsing various date formats
                // Format: "January 15, 2024" -> "2024-01-15"
                DateTimeFormatter[] formatters = {
                    DateTimeFormatter.ofPattern("MMMM d, yyyy"),
                    DateTimeFormatter.ofPattern("MMM d, yyyy"),
                    DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                    DateTimeFormatter.ofPattern("MM/dd/yyyy"),
                    DateTimeFormatter.ofPattern("dd/MM/yyyy")
                };
                
                for (DateTimeFormatter formatter : formatters) {
                    try {
                        LocalDate date = LocalDate.parse(value, formatter);
                        return date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                    } catch (DateTimeParseException e) {
                        // Try next format
                    }
                }
                
                // If all parsing fails, return as-is (will cause SQL error, but better than silent failure)
                return value;
            } catch (Exception e) {
                return value;
            }
        }
        
        // For other fields, return as-is
        return value;
    }
}
