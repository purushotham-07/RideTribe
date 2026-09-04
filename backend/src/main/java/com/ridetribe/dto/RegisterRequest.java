package com.ridetribe.dto;

import com.ridetribe.model.TravelMode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String phone;
    private String gender; // MALE, FEMALE, OTHER
    private Integer age; // e.g. 25
    private String avatarUrl;
    private TravelMode preferredMode;
    private String vehicleModel;
    private String vehicleNumber;
    private String vehiclePhotoUrl;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String bio;
}
