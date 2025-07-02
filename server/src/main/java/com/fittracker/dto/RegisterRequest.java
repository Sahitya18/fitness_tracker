package com.fittracker.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data
public class RegisterRequest {
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;
    
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be exactly 10 digits")
    @NotBlank(message = "Mobile number is required")
    private String mobile;
    
    @Size(min = 6, message = "Password must be at least 6 characters")
    @NotBlank(message = "Password is required")
    private String password;
    
    @NotBlank(message = "OTP is required")
    private String otp;
    
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    
    @DecimalMin(value = "100.0", message = "Height must be at least 100 cm")
    @DecimalMax(value = "250.0", message = "Height must be at most 250 cm")
    private Double height;
    
    @DecimalMin(value = "30.0", message = "Weight must be at least 30 kg")
    @DecimalMax(value = "300.0", message = "Weight must be at most 300 kg")
    private Double weight;
    
    @DecimalMin(value = "30.0", message = "Target weight must be at least 30 kg")
    @DecimalMax(value = "300.0", message = "Target weight must be at most 300 kg")
    private Double targetWeight;
    
    private Double weeklyGoal;
    private String fitnessGoal;
    private String activityLevel;
    private String dietaryPreference;
    private String workoutPreference;
    
    // Profile fields
    private Integer age;
}