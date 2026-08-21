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
public class RegroupAlertDTO {
    private Long rideGroupId;
    private Long laggingUserId;
    private String laggingUserName;
    private String laggingUserAvatar;
    private Double laggingLat;
    private Double laggingLng;
    private Double distanceFromGroupKm;
    private String message;
    @Builder.Default
    private LocalDateTime alertTime = LocalDateTime.now();
}
