package com.fitness.register_service.repository;

import com.fitness.register_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface updateUserDetails extends JpaRepository<User, Long> {

    @Modifying
    @Transactional
    @Query(value = """
            UPDATE users
            SET
                first_name = CASE WHEN :field = 'first_name' THEN :fieldValue ELSE first_name END,
                last_name = CASE WHEN :field = 'last_name' THEN :fieldValue ELSE last_name END,
                gender = CASE WHEN :field = 'gender' THEN :fieldValue ELSE gender END,
                mobile = CASE WHEN :field = 'mobile' THEN :fieldValue ELSE mobile END,
                date_of_birth = CASE WHEN :field = 'date_of_birth' THEN CAST(:fieldValue AS DATE) ELSE date_of_birth END,
                height = CASE WHEN :field = 'height' THEN CAST(:fieldValue AS DOUBLE) ELSE height END,
                weight = CASE WHEN :field = 'weight' THEN CAST(:fieldValue AS DOUBLE) ELSE weight END,
                updated_at = CURRENT_TIMESTAMP,
                goal = CASE WHEN :field = 'goal' THEN :fieldValue ELSE goal END,
                mealPreference = CASE WHEN :field = 'meal_preference' THEN :fieldValue ELSE meal_preference END,
                activityLevel = CASE WHEN :field = 'activity_level' THEN :fieldValue ELSE activity_level END,
                age = CASE WHEN :field = 'age' THEN :fieldValue ELSE age END,
                workoutPlace = CASE WHEN :field = 'workout_place' THEN :fieldValue ELSE workout_place END,
                sports = CASE WHEN :field = 'sports' THEN CAST(:fieldValue AS JSON) ELSE sports END
            WHERE email = :email
            """, nativeQuery = true)
    int updateUserFieldByEmail(@Param("email") String email,
                               @Param("field") String field,
                               @Param("fieldValue") String fieldValue);
}
