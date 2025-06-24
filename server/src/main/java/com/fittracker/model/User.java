package com.fittracker.model;

import jakarta.persistence.*; // ✅ Use JPA annotations
import lombok.Getter;
import lombok.Setter;
@Getter
@Entity
@Setter
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String mobile;

    private String passwordHash;

    private boolean isVerified;

}