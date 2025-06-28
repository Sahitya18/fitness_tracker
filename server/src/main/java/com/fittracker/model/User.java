package com.fittracker.model;

import jakarta.persistence.*; // ✅ Use JPA annotations
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
@Getter
@Entity
@Setter
@Table(name = "users")
public class User {
    @Id @GeneratedValue Long id;
    private String email;
    private String mobile;
    @Column(name="password_hash") private String passwordHash;
    private boolean emailVerified;
    private boolean mobileVerified;

}