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
    private Long rideGroupId;
    private Double centroidLat;
    private Double centroidLng;
    private Long leadUserId;
    private Map<Long, LocationUpdateDTO> locations;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
