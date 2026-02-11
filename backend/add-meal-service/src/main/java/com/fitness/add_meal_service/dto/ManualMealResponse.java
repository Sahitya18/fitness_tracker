package com.fitness.add_meal_service.dto;

import lombok.Data;

@Data
public class ManualMealResponse {

    private Long id;
    private String mealName;
    private Double weight;
    private String weightUnit;
    private Double calories;
    private Double carbs;
    private Double protein;
    private Double fats;
    private Double fiber;
}

