package com.ridetribe.dto;

import com.ridetribe.model.TravelMode;
import com.ridetribe.model.User;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String name;
    private String email;
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
    private Double avgRating;
    private Integer totalRatings;
    private Integer ridesCompleted;
    private String bio;
    private LocalDateTime createdAt;

    public static UserDTO fromEntity(User user) {
        if (user == null) return null;
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .age(user.getAge())
                .avatarUrl(user.getAvatarUrl())
                .preferredMode(user.getPreferredMode())
                .vehicleModel(user.getVehicleModel())
                .vehicleNumber(user.getVehicleNumber())
                .vehiclePhotoUrl(user.getVehiclePhotoUrl())
                .emergencyContactName(user.getEmergencyContactName())
                .emergencyContactPhone(user.getEmergencyContactPhone())
                .avgRating(user.getAvgRating())
                .totalRatings(user.getTotalRatings())
                .ridesCompleted(user.getRidesCompleted())
                .bio(user.getBio())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
