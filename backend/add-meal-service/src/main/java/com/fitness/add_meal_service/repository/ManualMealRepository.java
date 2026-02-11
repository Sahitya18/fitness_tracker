package com.fitness.add_meal_service.repository;

import com.fitness.add_meal_service.model.ManualMeal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ManualMealRepository extends JpaRepository<ManualMeal, Long> {

    Optional<ManualMeal> findByMealNameIgnoreCase(String mealName);

    List<ManualMeal> findTop10ByMealNameContainingIgnoreCaseOrderByMealNameAsc(String keyword);
}

