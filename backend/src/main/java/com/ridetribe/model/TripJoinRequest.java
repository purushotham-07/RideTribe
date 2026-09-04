package com.ridetribe.model;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Schema Design Decision:
 * TripJoinRequest is embedded as a subdocument array inside the RideGroup document
 * because join requests are strictly scoped to a single trip and are always read,
 * evaluated, and mutated within the context of managing that trip's convoy roster.
 * Embedding guarantees atomic transactional request approval / capacity auto-lock
 * without requiring distributed multi-document transaction locks.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripJoinRequest {

    private String id;

    private String tripId;

    private User user;

    private String message;

    @Builder.Default
    private JoinRequestStatus status = JoinRequestStatus.PENDING;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime respondedAt;
}
