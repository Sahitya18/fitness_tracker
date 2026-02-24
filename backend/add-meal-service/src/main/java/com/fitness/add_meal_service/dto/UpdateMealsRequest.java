package com.fitness.add_meal_service.dto;

import lombok.Data;

import java.util.List;

/**
 * Supports two shapes:
 * 1) Bulk sync: { userId, mealDate, meals: [ {mealType, items, totalCalories}, ... ] }
 * 2) Single slot update: { userId, mealDate, mealType, items, totalCalories }
 */
@Data
public class UpdateMealsRequest {
    private Long userId;
    private String mealDate; // yyyy-MM-dd

    // bulk
    private List<MealSlotDto> meals;

    // single
    private String mealType;
    private List<MealItemDto> items;
    private Double totalCalories;
}


