package com.fitness.add_meal_service.repository;

import com.fitness.add_meal_service.model.UserDailyMeals;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface UserDailyMealsRepository extends JpaRepository<UserDailyMeals, Long> {
    Optional<UserDailyMeals> findByUserIdAndMealDate(Long userId, LocalDate mealDate);
}


