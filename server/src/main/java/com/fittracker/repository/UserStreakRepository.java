package com.fittracker.repository;

import com.fittracker.model.UserStreak;
import com.fittracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserStreakRepository extends JpaRepository<UserStreak, Long> {
    Optional<UserStreak> findByUser(User user);
} 