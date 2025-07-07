CREATE TABLE user_streaks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_activity_date DATE,
    streak_start_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE (user_id)
); 