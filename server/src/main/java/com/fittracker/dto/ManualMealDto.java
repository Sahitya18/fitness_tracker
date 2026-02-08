package com.fittracker.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Data
public class ManualMealDto {
    private Long id;
    
    @NotBlank(message = "Meal name is required")
    private String mealName;
    
    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    private Double weight;
    
    @NotBlank(message = "Weight unit is required")
    private String weightUnit;
    
    @NotNull(message = "Calories are required")
    @Positive(message = "Calories must be positive")
    private Double calories;
    
    private Double carbs;
    
    private Double protein;
    
    private Double fats;
    
    private Double fiber;
}

