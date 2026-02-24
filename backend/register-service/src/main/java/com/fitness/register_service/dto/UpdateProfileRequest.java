package com.fitness.register_service.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String email;
    private String field;
    private String value;
}
