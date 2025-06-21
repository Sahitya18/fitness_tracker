package com.fittracker.model;

@Entity
public class User {
    @Id @GeneratedValue private Long id;
    private String email;
    private String mobile;
    private String passwordHash;
    private boolean isVerified;
}