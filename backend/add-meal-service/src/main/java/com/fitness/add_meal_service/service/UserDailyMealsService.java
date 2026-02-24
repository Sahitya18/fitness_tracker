package com.fitness.add_meal_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fitness.add_meal_service.dto.MealItemDto;
import com.fitness.add_meal_service.dto.MealSlotDto;
import com.fitness.add_meal_service.model.UserDailyMeals;
import com.fitness.add_meal_service.repository.UserDailyMealsRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserDailyMealsService {

    private final UserDailyMealsRepository repo;
    private final ObjectMapper objectMapper;

    public UserDailyMealsService(UserDailyMealsRepository repo, ObjectMapper objectMapper) {
        this.repo = repo;
        this.objectMapper = objectMapper;
    }

    public UserDailyMeals upsertBulk(Long userId, LocalDate mealDate, List<MealSlotDto> meals) {
        UserDailyMeals row = repo.findByUserIdAndMealDate(userId, mealDate).orElseGet(UserDailyMeals::new);
        row.setUserId(userId);
        row.setMealDate(mealDate);

        // bulk sync from client omits empty slots, so we must clear everything first
        clearAllSlots(row);

        if (meals != null) {
            for (MealSlotDto m : meals) {
                if (m == null) continue;
                applySlot(row, m.getMealType(), m.getItems(), safeDouble(m.getTotalCalories()));
            }
        }

        recalcTotalCalories(row);
        return repo.save(row);
    }

    public UserDailyMeals upsertSingle(Long userId, LocalDate mealDate, String mealType, List<MealItemDto> items, Double totalCalories) {
        UserDailyMeals row = repo.findByUserIdAndMealDate(userId, mealDate).orElseGet(UserDailyMeals::new);
        row.setUserId(userId);
        row.setMealDate(mealDate);

        applySlot(row, mealType, items, safeDouble(totalCalories));
        recalcTotalCalories(row);

        return repo.save(row);
    }

    public Optional<UserDailyMeals> getByUserAndDate(Long userId, LocalDate mealDate) {
        return repo.findByUserIdAndMealDate(userId, mealDate);
    }

    public com.fitness.add_meal_service.dto.UserDailyMealsResponse toResponse(UserDailyMeals row) {
        com.fitness.add_meal_service.dto.UserDailyMealsResponse res = new com.fitness.add_meal_service.dto.UserDailyMealsResponse();
        res.setId(row.getId());
        res.setUserId(row.getUserId());
        res.setMealDate(row.getMealDate());

        res.setBreakfast(parseJson(row.getBreakfast()));
        res.setPostBreakfast(parseJson(row.getPostBreakfast()));
        res.setLunch(parseJson(row.getLunch()));
        res.setPostLunch(parseJson(row.getPostLunch()));
        res.setPreWorkout(parseJson(row.getPreWorkout()));
        res.setDinner(parseJson(row.getDinner()));

        res.setBreakfastCalories(row.getBreakfastCalories());
        res.setPostBreakfastCalories(row.getPostBreakfastCalories());
        res.setLunchCalories(row.getLunchCalories());
        res.setPostLunchCalories(row.getPostLunchCalories());
        res.setPreWorkoutCalories(row.getPreWorkoutCalories());
        res.setDinnerCalories(row.getDinnerCalories());
        res.setTotalCalories(row.getTotalCalories());

        res.setCreatedAt(row.getCreatedAt());
        res.setUpdatedAt(row.getUpdatedAt());
        return res;
    }

    private Map<String, Object> parseJson(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse meal slot JSON", e);
        }
    }

    private void clearAllSlots(UserDailyMeals row) {
        row.setBreakfast(null);
        row.setPostBreakfast(null);
        row.setLunch(null);
        row.setPostLunch(null);
        row.setPreWorkout(null);
        row.setDinner(null);

        row.setBreakfastCalories(0d);
        row.setPostBreakfastCalories(0d);
        row.setLunchCalories(0d);
        row.setPostLunchCalories(0d);
        row.setPreWorkoutCalories(0d);
        row.setDinnerCalories(0d);
        row.setTotalCalories(0d);
    }

    private void applySlot(UserDailyMeals row, String mealTypeRaw, List<MealItemDto> items, Double totalCalories) {
        MealSlot slot = MealSlot.from(mealTypeRaw);
        if (slot == null) return; // ignore unknown meal types safely

        String json = toJson(slot, items, totalCalories);
        switch (slot) {
            case BREAKFAST -> {
                row.setBreakfast(json);
                row.setBreakfastCalories(totalCalories);
            }
            case POST_BREAKFAST -> {
                row.setPostBreakfast(json);
                row.setPostBreakfastCalories(totalCalories);
            }
            case LUNCH -> {
                row.setLunch(json);
                row.setLunchCalories(totalCalories);
            }
            case POST_LUNCH -> {
                row.setPostLunch(json);
                row.setPostLunchCalories(totalCalories);
            }
            case PRE_WORKOUT -> {
                row.setPreWorkout(json);
                row.setPreWorkoutCalories(totalCalories);
            }
            case DINNER -> {
                row.setDinner(json);
                row.setDinnerCalories(totalCalories);
            }
        }
    }

    private void recalcTotalCalories(UserDailyMeals row) {
        double sum = 0d;
        sum += safeDouble(row.getBreakfastCalories());
        sum += safeDouble(row.getPostBreakfastCalories());
        sum += safeDouble(row.getLunchCalories());
        sum += safeDouble(row.getPostLunchCalories());
        sum += safeDouble(row.getPreWorkoutCalories());
        sum += safeDouble(row.getDinnerCalories());
        row.setTotalCalories(sum);
    }

    private Double safeDouble(Double d) {
        return d == null ? 0d : d;
    }

    private String toJson(MealSlot slot, List<MealItemDto> items, Double totalCalories) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("mealType", slot.jsonKey);
        payload.put("items", items == null ? List.of() : items);
        payload.put("totalCalories", safeDouble(totalCalories));

        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize meal slot JSON", e);
        }
    }

    private enum MealSlot {
        BREAKFAST("breakfast"),
        POST_BREAKFAST("postBreakfast"),
        LUNCH("lunch"),
        POST_LUNCH("postLunch"),
        PRE_WORKOUT("preWorkout"),
        DINNER("dinner");

        private final String jsonKey;

        MealSlot(String jsonKey) {
            this.jsonKey = jsonKey;
        }

        static MealSlot from(String raw) {
            if (raw == null) return null;
            String s = raw.trim();
            if (s.isEmpty()) return null;

            // accept both camelCase and snake_case from clients
            return switch (s) {
                case "breakfast" -> BREAKFAST;
                case "postBreakfast", "post_breakfast" -> POST_BREAKFAST;
                case "lunch" -> LUNCH;
                case "postLunch", "post_lunch" -> POST_LUNCH;
                case "preWorkout", "pre_workout" -> PRE_WORKOUT;
                case "dinner" -> DINNER;
                default -> null;
            };
        }
    }
}


