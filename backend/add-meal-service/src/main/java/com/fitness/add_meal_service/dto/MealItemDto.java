package com.fitness.add_meal_service.dto;

import lombok.Data;

@Data
public class MealItemDto {
    private String name;
    private String quantity;
    private MacrosDto macros;
}


