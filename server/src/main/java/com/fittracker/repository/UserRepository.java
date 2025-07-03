package com.fittracker.repository;

import com.fittracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByMobile(String mobile);
    Optional<User> findByEmail(String email);
    Optional<User> findByMobile(String mobile);
}
