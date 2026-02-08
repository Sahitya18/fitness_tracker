package com.fittracker.service;

import com.fittracker.dto.ManualMealDto;
import com.fittracker.model.ManualMeal;
import com.fittracker.repository.ManualMealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ManualMealService {
    
    @Autowired
    private ManualMealRepository manualMealRepository;
    
    public ManualMealDto createManualMeal(ManualMealDto dto) {
        // Check if meal name already exists
        if (manualMealRepository.findByMealNameIgnoreCase(dto.getMealName()).size() > 0) {
            throw new RuntimeException("Meal name '" + dto.getMealName() + "' already exists");
        }
        
        ManualMeal meal = new ManualMeal();
        meal.setMealName(dto.getMealName());
        meal.setWeight(dto.getWeight());
        meal.setWeightUnit(dto.getWeightUnit());
        meal.setCalories(dto.getCalories());
        meal.setCarbs(dto.getCarbs());
        meal.setProtein(dto.getProtein());
        meal.setFats(dto.getFats());
        meal.setFiber(dto.getFiber());
        
        ManualMeal savedMeal = manualMealRepository.save(meal);
        return convertToDto(savedMeal);
    }
    
    public List<ManualMealDto> getAllManualMeals() {
        return manualMealRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public Optional<ManualMealDto> getManualMealById(Long id) {
        return manualMealRepository.findById(id)
                .map(this::convertToDto);
    }
    
    public List<ManualMealDto> searchManualMealsByName(String mealName) {
        return manualMealRepository.findByMealNameContainingIgnoreCase(mealName)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public ManualMealDto updateManualMeal(Long id, ManualMealDto dto) {
        Optional<ManualMeal> existingMeal = manualMealRepository.findById(id);
        if (existingMeal.isPresent()) {
            ManualMeal meal = existingMeal.get();
            meal.setMealName(dto.getMealName());
            meal.setWeight(dto.getWeight());
            meal.setWeightUnit(dto.getWeightUnit());
            meal.setCalories(dto.getCalories());
            meal.setCarbs(dto.getCarbs());
            meal.setProtein(dto.getProtein());
            meal.setFats(dto.getFats());
            meal.setFiber(dto.getFiber());
            
            ManualMeal updatedMeal = manualMealRepository.save(meal);
            return convertToDto(updatedMeal);
        }
        return null;
    }
    
    public boolean deleteManualMeal(Long id) {
        if (manualMealRepository.existsById(id)) {
            manualMealRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    private ManualMealDto convertToDto(ManualMeal meal) {
        ManualMealDto dto = new ManualMealDto();
        dto.setId(meal.getId());
        dto.setMealName(meal.getMealName());
        dto.setWeight(meal.getWeight());
        dto.setWeightUnit(meal.getWeightUnit());
        dto.setCalories(meal.getCalories());
        dto.setCarbs(meal.getCarbs());
        dto.setProtein(meal.getProtein());
        dto.setFats(meal.getFats());
        dto.setFiber(meal.getFiber());
        return dto;
    }
}
