package com.fitness.add_meal_service.dto;

import lombok.Data;

import java.util.List;

@Data
public class MealSlotDto {
    private String mealType; // breakfast, postBreakfast, postLunch, preWorkout, etc.
    private List<MealItemDto> items;
    private Double totalCalories;
}


