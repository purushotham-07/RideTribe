package com.ridetribe.dto;

import com.ridetribe.model.RideGroup;
import com.ridetribe.model.RideGroupStatus;
import com.ridetribe.model.TravelMode;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripDTO {
    private String id;
    private String title;
    private String description;
    private UserDTO hostUser;
    private String destination;
    private TravelMode travelMode;
    private LocalDate rideDate;
    private LocalTime scheduledTime;
    private Integer numberOfDays;
    private Integer maxMembers;
    private Integer currentMembersCount;
    private Boolean isFull;
    private String whatToCarry;
    private String coverImageUrl;

    private String meetingPointName;
    private Double meetingPointLat;
    private Double meetingPointLng;

    private Double destinationLat;
    private Double destinationLng;
    private Double estimatedDistanceKm;

    private RideGroupStatus status;
    private List<RideGroupMemberDTO> members;
    private List<TripJoinRequestDTO> pendingRequests; // Visible to host
    private String myJoinRequestStatus; // PENDING, APPROVED, REJECTED, or null

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;

    public static TripDTO fromEntity(RideGroup trip) {
        return fromEntity(trip, null);
    }

    public static TripDTO fromEntity(RideGroup trip, String currentUserId) {
        if (trip == null) return null;

        List<RideGroupMemberDTO> memberDTOs = trip.getMembers() != null
                ? trip.getMembers().stream().map(RideGroupMemberDTO::fromEntity).collect(Collectors.toList())
                : List.of();

        List<TripJoinRequestDTO> requestDTOs = trip.getRequests() != null
                ? trip.getRequests().stream().map(TripJoinRequestDTO::fromEntity).collect(Collectors.toList())
                : List.of();

        String myStatus = null;
        if (currentUserId != null && trip.getRequests() != null) {
            myStatus = trip.getRequests().stream()
                    .filter(r -> r.getUser() != null && currentUserId.equals(r.getUser().getId()))
                    .map(r -> r.getStatus().name())
                    .findFirst()
                    .orElse(null);
        }

        int memberCount = memberDTOs.size();
        int max = trip.getMaxMembers() != null ? trip.getMaxMembers() : 5;
        boolean full = memberCount >= max;

        return TripDTO.builder()
                .id(trip.getId())
                .title(trip.getTitle() != null ? trip.getTitle() : (trip.getDestination() + " Group Ride"))
                .description(trip.getDescription())
                .hostUser(UserDTO.fromEntity(trip.getHostUser()))
                .destination(trip.getDestination())
                .travelMode(trip.getTravelMode())
                .rideDate(trip.getRideDate())
                .scheduledTime(trip.getScheduledTime())
                .numberOfDays(trip.getNumberOfDays() != null ? trip.getNumberOfDays() : 1)
                .maxMembers(max)
                .currentMembersCount(memberCount)
                .isFull(full)
                .whatToCarry(trip.getWhatToCarry())
                .coverImageUrl(trip.getCoverImageUrl())
                .meetingPointName(trip.getMeetingPointName())
                .meetingPointLat(trip.getMeetingPointLat())
                .meetingPointLng(trip.getMeetingPointLng())
                .destinationLat(trip.getDestinationLat())
                .destinationLng(trip.getDestinationLng())
                .estimatedDistanceKm(trip.getEstimatedDistanceKm())
                .status(trip.getStatus())
                .members(memberDTOs)
                .pendingRequests(requestDTOs)
                .myJoinRequestStatus(myStatus)
                .startedAt(trip.getStartedAt())
                .completedAt(trip.getCompletedAt())
                .createdAt(trip.getCreatedAt())
                .build();
    }
}
