package com.fittracker.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class OtpRequest {
    @Email(message = "Invalid email format")
    private String email;
    
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be exactly 10 digits")
    private String mobile;
    
    private String otp;
}
