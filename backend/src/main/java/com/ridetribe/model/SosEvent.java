package com.ridetribe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sos_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SosEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"intents", "passwordHash"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ride_group_id", nullable = false)
    @JsonIgnoreProperties({"members"})
    private RideGroup rideGroup;

    private Double lat;
    private Double lng;

    private String emergencyContactName;
    private String emergencyContactPhone;

    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SosStatus status = SosStatus.ACTIVE;

    @Builder.Default
    private LocalDateTime triggeredAt = LocalDateTime.now();

    private LocalDateTime resolvedAt;
}
