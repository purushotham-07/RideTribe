package com.ridetribe.dto;

import com.ridetribe.model.TravelMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileUpdateRequest {
    private String name;
    private String phone;
    private String gender;
    private Integer age;
    private String avatarUrl;
    private TravelMode preferredMode;
    private String vehicleModel;
    private String vehicleNumber;
    private String vehiclePhotoUrl;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String bio;
}
