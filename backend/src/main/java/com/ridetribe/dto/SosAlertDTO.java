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
public class SosAlertDTO {
    private String sosEventId;
    private String rideGroupId;
    private String userId;
    private String userName;
    private String userAvatar;
    private String vehicleModel;
    private Double lat;
    private Double lng;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String notes;
    @Builder.Default
    private LocalDateTime triggeredAt = LocalDateTime.now();
}
