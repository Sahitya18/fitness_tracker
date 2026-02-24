package com.fitness.add_meal_service.controller;

import com.fitness.add_meal_service.dto.ManualMealRequest;
import com.fitness.add_meal_service.dto.ManualMealResponse;
import com.fitness.add_meal_service.service.ManualMealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/meals")
public class SearchMealController {

    @Autowired
    private ManualMealService manualMealService;

    @GetMapping("/search")
    public ResponseEntity<List<ManualMealResponse>> searchMeals(@RequestParam String keyword) {
        System.out.println("API hit");
        if (keyword == null || keyword.trim().length() < 1) {
            return ResponseEntity.badRequest().build();
        }

        List<ManualMealResponse> results = manualMealService.search(keyword);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/manual-meals")
    public ResponseEntity<?> addManualMeal(@RequestBody ManualMealRequest manualMealRequest) {
        return manualMealService.addManualMeal(manualMealRequest);
    }
}
