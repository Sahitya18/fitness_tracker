package com.fitness.add_meal_service.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "user_daily_meals")
public class UserDailyMeals {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "meal_date", nullable = false)
    private LocalDate mealDate;

    @Column(name = "breakfast", columnDefinition = "json")
    private String breakfast;

    @Column(name = "post_breakfast", columnDefinition = "json")
    private String postBreakfast;

    @Column(name = "lunch", columnDefinition = "json")
    private String lunch;

    @Column(name = "post_lunch", columnDefinition = "json")
    private String postLunch;

    @Column(name = "pre_workout", columnDefinition = "json")
    private String preWorkout;

    @Column(name = "dinner", columnDefinition = "json")
    private String dinner;

    @Column(name = "breakfast_calories")
    private Double breakfastCalories = 0d;

    @Column(name = "post_breakfast_calories")
    private Double postBreakfastCalories = 0d;

    @Column(name = "lunch_calories")
    private Double lunchCalories = 0d;

    @Column(name = "post_lunch_calories")
    private Double postLunchCalories = 0d;

    @Column(name = "pre_workout_calories")
    private Double preWorkoutCalories = 0d;

    @Column(name = "dinner_calories")
    private Double dinnerCalories = 0d;

    @Column(name = "total_calories")
    private Double totalCalories = 0d;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


