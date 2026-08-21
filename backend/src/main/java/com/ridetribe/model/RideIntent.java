package com.ridetribe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "ride_intents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideIntent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"intents", "passwordHash"})
    private User user;

    @Column(nullable = false)
    private String destination; // e.g. "Nandi Hills", "Coorg", "Chikmagalur", "Lepakshi"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TravelMode travelMode; // BIKE or CAR

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Pace pace = Pace.MODERATE;

    @Column(nullable = false)
    private LocalDate rideDate;

    @Column(nullable = false)
    private LocalTime windowStartTime; // e.g. 05:00 AM

    @Column(nullable = false)
    private LocalTime windowEndTime; // e.g. 07:00 AM

    private String startingArea; // e.g. "Indiranagar", "Koramangala", "Hebbal", "Whitefield"

    @Column(length = 1000)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RideIntentStatus status = RideIntentStatus.PENDING;

    private Long matchedGroupId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
