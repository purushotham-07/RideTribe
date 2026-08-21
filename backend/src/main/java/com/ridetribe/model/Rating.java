package com.ridetribe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ratings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"ride_group_id", "rater_id", "ratee_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_group_id", nullable = false)
    @JsonIgnoreProperties({"members"})
    private RideGroup rideGroup;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rater_id", nullable = false)
    @JsonIgnoreProperties({"intents", "passwordHash"})
    private User rater;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ratee_id", nullable = false)
    @JsonIgnoreProperties({"intents", "passwordHash"})
    private User ratee;

    @Column(nullable = false)
    private Integer stars; // 1 to 5

    @Builder.Default
    private Boolean wouldRideAgain = true;

    private String tags; // e.g. "Great Lead, Safe Rider, Punctual"

    @Column(length = 1000)
    private String comment;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
