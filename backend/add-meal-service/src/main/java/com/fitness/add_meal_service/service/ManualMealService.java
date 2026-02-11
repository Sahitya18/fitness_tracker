package com.fitness.add_meal_service.service;

import com.fitness.add_meal_service.dto.ManualMealRequest;
import com.fitness.add_meal_service.dto.ManualMealResponse;
import com.fitness.add_meal_service.model.ManualMeal;
import com.fitness.add_meal_service.repository.ManualMealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ManualMealService {

    @Autowired
    private ManualMealRepository manualMealRepository;

    public ResponseEntity<?> addManualMeal(ManualMealRequest request) {
        if (request.getMealName() == null || request.getMealName().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Meal name is required");
            return ResponseEntity.badRequest().body(error);
        }
        if (request.getWeight() == null || request.getWeight() <= 0) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Weight must be greater than 0");
            return ResponseEntity.badRequest().body(error);
        }
        if (request.getWeightUnit() == null || request.getWeightUnit().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Weight unit is required");
            return ResponseEntity.badRequest().body(error);
        }
        if (request.getCalories() == null || request.getCalories() < 0) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Calories must be specified and non-negative");
            return ResponseEntity.badRequest().body(error);
        }

        // Enforce unique meal name
        if (manualMealRepository.findByMealNameIgnoreCase(request.getMealName()).isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Meal with this name already exists");
            return ResponseEntity.badRequest().body(error);
        }

        ManualMeal manualMeal = new ManualMeal();
        manualMeal.setMealName(request.getMealName());
        manualMeal.setWeight(request.getWeight());
        manualMeal.setWeightUnit(request.getWeightUnit());
        manualMeal.setCalories(request.getCalories());
        manualMeal.setCarbs(request.getCarbs());
        manualMeal.setProtein(request.getProtein());
        manualMeal.setFats(request.getFats());
        manualMeal.setFiber(request.getFiber());

        ManualMeal saved = manualMealRepository.save(manualMeal);
        ManualMealResponse response = toResponse(saved);
        return ResponseEntity.ok(response);
    }

    public List<ManualMealResponse> search(String keyword) {
        return manualMealRepository
                .findTop10ByMealNameContainingIgnoreCaseOrderByMealNameAsc(keyword.trim())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ManualMealResponse toResponse(ManualMeal manualMeal) {
        ManualMealResponse res = new ManualMealResponse();
        res.setId(manualMeal.getId());
        res.setMealName(manualMeal.getMealName());
        res.setWeight(manualMeal.getWeight());
        res.setWeightUnit(manualMeal.getWeightUnit());
        res.setCalories(manualMeal.getCalories());
        res.setCarbs(manualMeal.getCarbs());
        res.setProtein(manualMeal.getProtein());
        res.setFats(manualMeal.getFats());
        res.setFiber(manualMeal.getFiber());
        return res;
    }
}

