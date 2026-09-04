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
    private String userId;
    private String userName;
    private String avatarUrl;
    private String vehicleModel;
    private String rideGroupId;
    private Double lat;
    private Double lng;
    private Double speed;
    private Double heading;
    private Double battery;
    private Boolean onMyWay;
    private Boolean isLead;
    private Double distanceFromLeadKm;
    private Boolean isLagging;
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
