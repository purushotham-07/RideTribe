package com.ridetribe.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "ride_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideGroup {

    @Id
    private String id;

    private String title;

    private String description;

    private User hostUser;

    private String destination;

    private TravelMode travelMode;

    private LocalDate rideDate;

    private LocalTime scheduledTime;

    @Builder.Default
    private Integer numberOfDays = 1;

    @Builder.Default
    private Integer maxMembers = 5;

    private String whatToCarry;

    private String coverImageUrl;

    // Rendezvous checkpoint in Bangalore (coordinates for 2dsphere indexing)
    private String meetingPointName;
    private Double meetingPointLat;
    private Double meetingPointLng;

    // Destination coordinates
    private Double destinationLat;
    private Double destinationLng;

    private Double estimatedDistanceKm;

    @Indexed
    @Builder.Default
    private RideGroupStatus status = RideGroupStatus.FORMING;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    @Builder.Default
    private List<RideGroupMember> members = new ArrayList<>();

    @Builder.Default
    private List<TripJoinRequest> requests = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public boolean isFull() {
        return members != null && maxMembers != null && members.size() >= maxMembers;
    }
}
