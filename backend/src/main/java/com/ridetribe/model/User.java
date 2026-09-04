package com.ridetribe.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    @JsonIgnore
    private String passwordHash;

    private String phone;

    private String gender; // MALE, FEMALE, OTHER

    private Integer age;

    private String avatarUrl;

    private TravelMode preferredMode;

    private String vehicleModel;

    private String vehicleNumber;

    private String vehiclePhotoUrl;

    private String emergencyContactName;

    private String emergencyContactPhone;

    @Builder.Default
    private Double avgRating = 5.0;

    @Builder.Default
    private Integer totalRatings = 0;

    @Builder.Default
    private Integer ridesCompleted = 0;

    private String bio;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
