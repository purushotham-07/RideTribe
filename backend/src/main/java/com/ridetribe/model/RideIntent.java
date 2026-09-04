package com.ridetribe.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Document(collection = "ride_intents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideIntent {

    @Id
    private String id;

    @Indexed
    private String userId;

    private User user;

    private String destination;

    private TravelMode travelMode;

    private Pace pace;

    private LocalDate rideDate;

    private LocalTime windowStartTime;

    private LocalTime windowEndTime;

    private String startingArea;

    private String notes;

    @Indexed
    @Builder.Default
    private RideIntentStatus status = RideIntentStatus.PENDING;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
