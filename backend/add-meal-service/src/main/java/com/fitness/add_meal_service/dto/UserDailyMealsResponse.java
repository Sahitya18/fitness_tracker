package com.fitness.add_meal_service.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

public class UserDailyMealsResponse {

    private Long id;
    private Long userId;
    private LocalDate mealDate;

    private Map<String, Object> breakfast;
    private Map<String, Object> postBreakfast;
    private Map<String, Object> lunch;
    private Map<String, Object> postLunch;
    private Map<String, Object> preWorkout;
    private Map<String, Object> dinner;

    private Double breakfastCalories;
    private Double postBreakfastCalories;
    private Double lunchCalories;
    private Double postLunchCalories;
    private Double preWorkoutCalories;
    private Double dinnerCalories;
    private Double totalCalories;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDate getMealDate() {
        return mealDate;
    }

    public void setMealDate(LocalDate mealDate) {
        this.mealDate = mealDate;
    }

    public Map<String, Object> getBreakfast() {
        return breakfast;
    }

    public void setBreakfast(Map<String, Object> breakfast) {
        this.breakfast = breakfast;
    }

    public Map<String, Object> getPostBreakfast() {
        return postBreakfast;
    }

    public void setPostBreakfast(Map<String, Object> postBreakfast) {
        this.postBreakfast = postBreakfast;
    }

    public Map<String, Object> getLunch() {
        return lunch;
    }

    public void setLunch(Map<String, Object> lunch) {
        this.lunch = lunch;
    }

    public Map<String, Object> getPostLunch() {
        return postLunch;
    }

    public void setPostLunch(Map<String, Object> postLunch) {
        this.postLunch = postLunch;
    }

    public Map<String, Object> getPreWorkout() {
        return preWorkout;
    }

    public void setPreWorkout(Map<String, Object> preWorkout) {
        this.preWorkout = preWorkout;
    }

    public Map<String, Object> getDinner() {
        return dinner;
    }

    public void setDinner(Map<String, Object> dinner) {
        this.dinner = dinner;
    }

    public Double getBreakfastCalories() {
        return breakfastCalories;
    }

    public void setBreakfastCalories(Double breakfastCalories) {
        this.breakfastCalories = breakfastCalories;
    }

    public Double getPostBreakfastCalories() {
        return postBreakfastCalories;
    }

    public void setPostBreakfastCalories(Double postBreakfastCalories) {
        this.postBreakfastCalories = postBreakfastCalories;
    }

    public Double getLunchCalories() {
        return lunchCalories;
    }

    public void setLunchCalories(Double lunchCalories) {
        this.lunchCalories = lunchCalories;
    }

    public Double getPostLunchCalories() {
        return postLunchCalories;
    }

    public void setPostLunchCalories(Double postLunchCalories) {
        this.postLunchCalories = postLunchCalories;
    }

    public Double getPreWorkoutCalories() {
        return preWorkoutCalories;
    }

    public void setPreWorkoutCalories(Double preWorkoutCalories) {
        this.preWorkoutCalories = preWorkoutCalories;
    }

    public Double getDinnerCalories() {
        return dinnerCalories;
    }

    public void setDinnerCalories(Double dinnerCalories) {
        this.dinnerCalories = dinnerCalories;
    }

    public Double getTotalCalories() {
        return totalCalories;
    }

    public void setTotalCalories(Double totalCalories) {
        this.totalCalories = totalCalories;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}


