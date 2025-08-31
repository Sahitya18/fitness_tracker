package com.fittracker.controller;

import com.fittracker.dto.ManualMealDto;
import com.fittracker.service.ManualMealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/manual-meals")
@CrossOrigin(origins = "*")
public class ManualMealController {
    
    @Autowired
    private ManualMealService manualMealService;
    
    @PostMapping
    public ResponseEntity<?> createManualMeal(@Valid @RequestBody ManualMealDto dto) {
        try {
            ManualMealDto createdMeal = manualMealService.createManualMeal(dto);
            return ResponseEntity.ok(createdMeal);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("already exists")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Failed to create meal: " + e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<List<ManualMealDto>> getAllManualMeals() {
        List<ManualMealDto> meals = manualMealService.getAllManualMeals();
        return ResponseEntity.ok(meals);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ManualMealDto> getManualMealById(@PathVariable Long id) {
        Optional<ManualMealDto> meal = manualMealService.getManualMealById(id);
        return meal.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<ManualMealDto>> searchManualMeals(@RequestParam String mealName) {
        List<ManualMealDto> meals = manualMealService.searchManualMealsByName(mealName);
        return ResponseEntity.ok(meals);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ManualMealDto> updateManualMeal(@PathVariable Long id, 
                                                         @Valid @RequestBody ManualMealDto dto) {
        ManualMealDto updatedMeal = manualMealService.updateManualMeal(id, dto);
        if (updatedMeal != null) {
            return ResponseEntity.ok(updatedMeal);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteManualMeal(@PathVariable Long id) {
        boolean deleted = manualMealService.deleteManualMeal(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
