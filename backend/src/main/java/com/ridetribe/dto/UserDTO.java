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

    // Explicit Getters and Setters for 100% IDE & VS Code Language Server Compatibility
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public TravelMode getPreferredMode() { return preferredMode; }
    public void setPreferredMode(TravelMode preferredMode) { this.preferredMode = preferredMode; }

    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getVehiclePhotoUrl() { return vehiclePhotoUrl; }
    public void setVehiclePhotoUrl(String vehiclePhotoUrl) { this.vehiclePhotoUrl = vehiclePhotoUrl; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }

    public Double getAvgRating() { return avgRating; }
    public void setAvgRating(Double avgRating) { this.avgRating = avgRating; }

    public Integer getTotalRatings() { return totalRatings; }
    public void setTotalRatings(Integer totalRatings) { this.totalRatings = totalRatings; }

    public Integer getRidesCompleted() { return ridesCompleted; }
    public void setRidesCompleted(Integer ridesCompleted) { this.ridesCompleted = ridesCompleted; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static UserDTO fromEntity(User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setGender(user.getGender());
        dto.setAge(user.getAge());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setPreferredMode(user.getPreferredMode());
        dto.setVehicleModel(user.getVehicleModel());
        dto.setVehicleNumber(user.getVehicleNumber());
        dto.setVehiclePhotoUrl(user.getVehiclePhotoUrl());
        dto.setEmergencyContactName(user.getEmergencyContactName());
        dto.setEmergencyContactPhone(user.getEmergencyContactPhone());
        dto.setAvgRating(user.getAvgRating());
        dto.setTotalRatings(user.getTotalRatings());
        dto.setRidesCompleted(user.getRidesCompleted());
        dto.setBio(user.getBio());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
