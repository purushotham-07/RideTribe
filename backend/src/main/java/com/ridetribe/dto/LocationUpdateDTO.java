package com.ridetribe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationUpdateDTO {
    private Long userId;
    private String userName;
    private String avatarUrl;
    private String vehicleModel;
    private Long rideGroupId;
    private Double lat;
    private Double lng;
    private Double speed;      // in km/h
    private Double heading;    // degrees (0-360)
    private Double battery;    // 0-100%
    private Boolean onMyWay;
    private Boolean isLead;
    private Double distanceFromLeadKm;
    private Boolean isLagging;
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
