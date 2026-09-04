package com.ridetribe.dto;

import com.ridetribe.model.TravelMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchingClusterDTO {
    private String rideGroupId;
    private String destination;
    private TravelMode travelMode;
    private LocalDate rideDate;
    private LocalTime scheduledTime;
    private String meetingPointName;
    private List<UserDTO> matchedUsers;
    private Double averageCompatibilityScore;
}
