package com.ridetribe.dto;

import com.ridetribe.model.Pace;
import com.ridetribe.model.RideIntent;
import com.ridetribe.model.RideIntentStatus;
import com.ridetribe.model.TravelMode;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideIntentDTO {
    private Long id;
    private UserDTO user;
    private String destination;
    private TravelMode travelMode;
    private Pace pace;
    private LocalDate rideDate;
    private LocalTime windowStartTime;
    private LocalTime windowEndTime;
    private String startingArea;
    private String notes;
    private RideIntentStatus status;
    private Long matchedGroupId;
    private LocalDateTime createdAt;

    public static RideIntentDTO fromEntity(RideIntent intent) {
        if (intent == null) return null;
        return RideIntentDTO.builder()
                .id(intent.getId())
                .user(UserDTO.fromEntity(intent.getUser()))
                .destination(intent.getDestination())
                .travelMode(intent.getTravelMode())
                .pace(intent.getPace())
                .rideDate(intent.getRideDate())
                .windowStartTime(intent.getWindowStartTime())
                .windowEndTime(intent.getWindowEndTime())
                .startingArea(intent.getStartingArea())
                .notes(intent.getNotes())
                .status(intent.getStatus())
                .matchedGroupId(intent.getMatchedGroupId())
                .createdAt(intent.getCreatedAt())
                .build();
    }
}
