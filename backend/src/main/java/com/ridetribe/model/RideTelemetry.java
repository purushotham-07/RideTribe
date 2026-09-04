package com.ridetribe.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * High-frequency real-time telemetry document.
 * Scalability Architecture Decision:
 * Kept separate from RideGroup so high-frequency GPS ticks (e.g. 1-2 pings/sec per rider)
 * update isolated lightweight telemetry documents without write contention or lock contention
 * on the parent RideGroup document.
 */
@Document(collection = "ride_telemetry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideTelemetry {

    @Id
    private String id; // Composite key: rideGroupId_userId

    @Indexed
    private String rideGroupId;

    @Indexed
    private String userId;

    private String userName;

    private String avatarUrl;

    private String vehicleModel;

    private Double lat;

    private Double lng;

    private Double speed;

    private Double heading;

    @Builder.Default
    private Boolean isLead = false;

    @Builder.Default
    private Boolean onMyWay = false;

    @Builder.Default
    private Boolean hasSos = false;

    private Double distanceFromLeadKm;

    @Builder.Default
    private Boolean isLagging = false;

    @Builder.Default
    private LocalDateTime lastUpdated = LocalDateTime.now();
}
