package com.ridetribe.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String passwordHash;

    private String phone;

    private String gender; // MALE, FEMALE, OTHER

    private Integer age; // e.g. 25

    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TravelMode preferredMode;

    private String vehicleModel; // e.g. Royal Enfield Himalayan, Duke 390, Thar 4x4

    private String vehicleNumber; // e.g. KA-03-AB-1234

    private String vehiclePhotoUrl; // Cloudinary photo URL for the bike/car

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

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<RideIntent> intents = new ArrayList<>();
}
