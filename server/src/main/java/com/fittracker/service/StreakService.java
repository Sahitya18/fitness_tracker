package com.fittracker.service;

import com.fittracker.model.User;
import com.fittracker.model.UserStreak;
import com.fittracker.repository.UserRepository;
import com.fittracker.repository.UserStreakRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class StreakService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserStreakRepository streakRepository;

    @Transactional
    public UserStreak getUserStreak(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        return streakRepository.findByUser(user)
            .orElse(new UserStreak(user));
    }

    @Transactional
    public UserStreak recordActivity(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        UserStreak streak = streakRepository.findByUser(user)
            .orElse(new UserStreak(user));

        LocalDate today = LocalDate.now();
        LocalDate lastActivity = streak.getLastActivityDate();

        if (lastActivity == null) {
            // First activity ever
            streak.setCurrentStreak(1);
            streak.setLongestStreak(1);
            streak.setStreakStartDate(today);
        } else if (lastActivity.equals(today)) {
            // Already recorded today
            return streak;
        } else if (lastActivity.equals(today.minusDays(1))) {
            // Consecutive day
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
            if (streak.getCurrentStreak() > streak.getLongestStreak()) {
                streak.setLongestStreak(streak.getCurrentStreak());
            }
        } else {
            // Streak broken
            streak.setCurrentStreak(1);
            streak.setStreakStartDate(today);
        }

        streak.setLastActivityDate(today);
        return streakRepository.save(streak);
    }

    @Transactional
    public void checkAndUpdateStreaks() {
        streakRepository.findAll().forEach(streak -> {
            if (streak.isStreakBroken()) {
                streak.setCurrentStreak(0);
                streakRepository.save(streak);
            }
        });
    }

    public int getCurrentStreak(User user) {
        return streakRepository.findByUser(user)
            .map(UserStreak::getCurrentStreak)
            .orElse(0);
    }

    public int getLongestStreak(User user) {
        return streakRepository.findByUser(user)
            .map(UserStreak::getLongestStreak)
            .orElse(0);
    }
} 