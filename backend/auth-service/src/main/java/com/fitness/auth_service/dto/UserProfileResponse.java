package com.fitness.auth_service.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UserProfileResponse {
    private Long id;
    private String email;
    private String mobile;
    private String name; // firstName + lastName combined
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private Double height;
    private Double weight;
    // Additional fields that frontend expects (can be null if not in DB)
    private Double targetWeight;
    private String fitnessGoal;
    private String activityLevel;
    private Integer currentStreak;
    private Integer totalWorkouts;
    private Double caloriesBurned;
    private Double weightLost;
    private Integer goalProgress;
    private Double avgDailyCalories;
    private Integer weeklyWorkouts;
    private Double waterIntake;
    private Double sleepAverage;
    private Integer stepsAverage;
}
