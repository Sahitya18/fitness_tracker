package com.fittracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Entity
@Setter
@Table(name = "manual_meals")
public class ManualMeal {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "meal_name", nullable = false, unique = true)
    private String mealName;
    
    @Column(name = "weight", nullable = false)
    private Double weight;
    
    @Column(name = "weight_unit", nullable = false)
    private String weightUnit;
    
    @Column(name = "calories", nullable = false)
    private Double calories;
    
    @Column(name = "carbs")
    private Double carbs;
    
    @Column(name = "protein")
    private Double protein;
    
    @Column(name = "fats")
    private Double fats;
    
    @Column(name = "fiber")
    private Double fiber;
    
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
