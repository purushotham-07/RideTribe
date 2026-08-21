package com.ridetribe.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ride_group_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"ride_group_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideGroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_group_id", nullable = false)
    @JsonBackReference
    private RideGroup rideGroup;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"intents", "passwordHash"})
    private User user;

    @Builder.Default
    private Boolean onMyWay = false;

    @Builder.Default
    private Boolean isLead = false;

    private Double currentLat;
    private Double currentLng;
    private Double currentSpeed;
    private Double currentHeading;
    private LocalDateTime lastLocationUpdate;

    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();
}
