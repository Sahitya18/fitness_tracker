package com.fitness.register_service.service;

import com.fitness.register_service.dto.CreateProfileRequest;
import com.fitness.register_service.dto.RegisterRequest;
import com.fitness.register_service.model.User;
import com.fitness.register_service.repository.ProfileRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import com.google.gson.Gson;


import java.util.Optional;

@Service
public class CreateProfile {

    @Autowired
    private ProfileRepository profileRepo;

    Gson gson = new Gson();

    @Transactional
    public ResponseEntity<?> completeUserProfile(@RequestBody CreateProfileRequest req) {
        try {
            Optional<User> userOpt = profileRepo.findByEmail(req.getEmail());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User user = userOpt.get();

            user.setFirstName(req.getFirstName());
            user.setLastName(req.getLastName());
            user.setDateOfBirth(req.getDateOfBirth());
            user.setGender(req.getGender());
            user.setHeight(req.getHeight());
            user.setWeight(req.getWeight());
            user.setGoal(req.getGoal());
            user.setMealPreference(req.getMealPreference());
            user.setActivityLevel(req.getActivityLevel());
            user.setAge(req.getAge());
            user.setWorkoutPlace(req.getWorkoutPlace());

            String sportsJson = gson.toJson(req.getSports());
            user.setSports(sportsJson);
            user.setTargetWeight(req.getTargetWeight());

            profileRepo.save(user);
            return ResponseEntity.ok("Profile completed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
