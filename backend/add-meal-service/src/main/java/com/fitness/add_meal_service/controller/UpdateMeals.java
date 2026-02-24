package com.fitness.add_meal_service.controller;

import com.fitness.add_meal_service.dto.UpdateMealsRequest;
import com.fitness.add_meal_service.dto.UserDailyMealsResponse;
import com.fitness.add_meal_service.model.UserAccount;
import com.fitness.add_meal_service.model.UserDailyMeals;
import com.fitness.add_meal_service.repository.UserAccountRepository;
import com.fitness.add_meal_service.service.UserDailyMealsService;
import com.fitness.add_meal_service.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/meals")
public class UpdateMeals {

    private final UserDailyMealsService userDailyMealsService;
    private final JwtUtil jwtUtil;
    private final UserAccountRepository userAccountRepository;

    public UpdateMeals(
            UserDailyMealsService userDailyMealsService,
            JwtUtil jwtUtil,
            UserAccountRepository userAccountRepository
    ) {
        this.userDailyMealsService = userDailyMealsService;
        this.jwtUtil = jwtUtil;
        this.userAccountRepository = userAccountRepository;
    }

    @PostMapping("/update-meals")
    public ResponseEntity<?> updateMeals(
            @RequestBody UpdateMealsRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        if (request == null) {
            return ResponseEntity.badRequest().body(error("Request body is required"));
        }

        LocalDate mealDate;
        try {
            if (request.getMealDate() == null || request.getMealDate().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(error("mealDate is required (yyyy-MM-dd)"));
            }
            mealDate = LocalDate.parse(request.getMealDate().trim());
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(error("Invalid mealDate. Expected yyyy-MM-dd"));
        }

        Long userId = resolveUserId(request.getUserId(), authorization);
        if (userId == null) {
            return ResponseEntity.badRequest().body(error("userId is required (either in payload or resolvable from Authorization token)"));
        }

        boolean isBulk = request.getMeals() != null;
        boolean isSingle = request.getMealType() != null && !request.getMealType().trim().isEmpty();

        if (!isBulk && !isSingle) {
            return ResponseEntity.badRequest().body(error("Invalid payload. Provide either `meals` (bulk) or `mealType` (single)."));
        }

        UserDailyMeals saved;
        if (isBulk) {
            saved = userDailyMealsService.upsertBulk(userId, mealDate, request.getMeals());
        } else {
            saved = userDailyMealsService.upsertSingle(
                    userId,
                    mealDate,
                    request.getMealType(),
                    request.getItems(),
                    request.getTotalCalories()
            );
        }

        Map<String, Object> res = new HashMap<>();
        res.put("message", "Meals updated successfully");
        res.put("userId", saved.getUserId());
        res.put("mealDate", saved.getMealDate().toString());
        res.put("totalCalories", saved.getTotalCalories());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/date/{mealDate}")
    public ResponseEntity<?> getMealsByDate(
            @PathVariable String mealDate,
            @RequestParam(value = "userId", required = false) Long userIdFromRequest,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        if (mealDate == null || mealDate.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(error("mealDate path variable is required (yyyy-MM-dd)"));
        }

        LocalDate parsedDate;
        try {
            parsedDate = LocalDate.parse(mealDate.trim());
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(error("Invalid mealDate. Expected yyyy-MM-dd"));
        }

        Long userId = resolveUserId(userIdFromRequest, authorization);
        if (userId == null) {
            return ResponseEntity.badRequest().body(error("userId is required (either as query param or resolvable from Authorization token)"));
        }

        Optional<UserDailyMeals> mealsOpt = userDailyMealsService.getByUserAndDate(userId, parsedDate);
        if (mealsOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        UserDailyMealsResponse response = userDailyMealsService.toResponse(mealsOpt.get());
        return ResponseEntity.ok(response);
    }

    private Long resolveUserId(Long userIdFromPayload, String authorization) {
        if (userIdFromPayload != null) return userIdFromPayload;
        if (authorization == null || authorization.isBlank()) return null;

        try {
            String email = jwtUtil.extractEmailFromToken(authorization);
            if (email == null || email.isBlank()) return null;
            Optional<UserAccount> userOpt = userAccountRepository.findByEmail(email);
            return userOpt.map(UserAccount::getId).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("error", message);
        return m;
    }
}
