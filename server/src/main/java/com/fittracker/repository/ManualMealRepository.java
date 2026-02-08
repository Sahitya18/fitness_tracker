package com.fittracker.repository;

import com.fittracker.model.ManualMeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ManualMealRepository extends JpaRepository<ManualMeal, Long> {
    List<ManualMeal> findByMealNameContainingIgnoreCase(String mealName);
    List<ManualMeal> findByMealNameIgnoreCase(String mealName);
}


