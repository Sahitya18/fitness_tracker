package com.fittracker.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LoginResponse {
    private String email;
    private String mobile;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private Double height;
    private Double weight;
    private String message;
} 