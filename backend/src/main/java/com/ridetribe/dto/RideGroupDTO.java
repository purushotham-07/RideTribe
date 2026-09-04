package com.ridetribe.dto;

import com.ridetribe.model.RideGroup;
import com.ridetribe.model.RideGroupStatus;
import com.ridetribe.model.TravelMode;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideGroupDTO {
    private String id;
    private String destination;
    private TravelMode travelMode;
    private LocalDate rideDate;
    private LocalTime scheduledTime;
    private String meetingPointName;
    private Double meetingPointLat;
    private Double meetingPointLng;
    private Double destinationLat;
    private Double destinationLng;
    private Double estimatedDistanceKm;
    private RideGroupStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private List<RideGroupMemberDTO> members;
    private LocalDateTime createdAt;

    public static RideGroupDTO fromEntity(RideGroup group) {
        if (group == null) return null;
        List<RideGroupMemberDTO> memberDTOs = group.getMembers() != null
                ? group.getMembers().stream().map(RideGroupMemberDTO::fromEntity).collect(Collectors.toList())
                : Collections.emptyList();

        return RideGroupDTO.builder()
                .id(group.getId())
                .destination(group.getDestination())
                .travelMode(group.getTravelMode())
                .rideDate(group.getRideDate())
                .scheduledTime(group.getScheduledTime())
                .meetingPointName(group.getMeetingPointName())
                .meetingPointLat(group.getMeetingPointLat())
                .meetingPointLng(group.getMeetingPointLng())
                .destinationLat(group.getDestinationLat())
                .destinationLng(group.getDestinationLng())
                .estimatedDistanceKm(group.getEstimatedDistanceKm())
                .status(group.getStatus())
                .startedAt(group.getStartedAt())
                .completedAt(group.getCompletedAt())
                .members(memberDTOs)
                .createdAt(group.getCreatedAt())
                .build();
    }
}
