package com.fittracker.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "user_streaks")
@Data
@NoArgsConstructor
public class UserStreak {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "current_streak", nullable = false)
    private int currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    private int longestStreak = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "streak_start_date")
    private LocalDate streakStartDate;

    public UserStreak(User user) {
        this.user = user;
        this.currentStreak = 0;
        this.longestStreak = 0;
    }

    // Helper method to check if streak is broken
    public boolean isStreakBroken() {
        if (lastActivityDate == null) return true;
        LocalDate yesterday = LocalDate.now().minusDays(1);
        return lastActivityDate.isBefore(yesterday);
    }

    // Helper method to update streak
    public void updateStreak(LocalDate activityDate) {
        if (lastActivityDate == null) {
            // First activity ever
            currentStreak = 1;
            longestStreak = 1;
            streakStartDate = activityDate;
        } else if (activityDate.equals(lastActivityDate)) {
            // Already logged activity today
            return;
        } else if (activityDate.equals(lastActivityDate.plusDays(1))) {
            // Consecutive day
            currentStreak++;
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }
        } else if (activityDate.equals(LocalDate.now()) && lastActivityDate.equals(LocalDate.now().minusDays(1))) {
            // Today's activity
            currentStreak++;
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }
        } else if (isStreakBroken()) {
            // Streak broken
            currentStreak = 1;
            streakStartDate = activityDate;
        }
        
        lastActivityDate = activityDate;
    }
} 