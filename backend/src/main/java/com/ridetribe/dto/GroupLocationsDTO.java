package com.ridetribe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupLocationsDTO {
    private String rideGroupId;
    private Double centroidLat;
    private Double centroidLng;
    private String leadUserId;
    private Map<String, LocationUpdateDTO> locations;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
