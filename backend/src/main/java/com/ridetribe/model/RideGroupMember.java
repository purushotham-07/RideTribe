package com.ridetribe.model;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Embedded subdocument representing an accepted member/rider in a RideGroup convoy.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideGroupMember {

    private String id; // Unique member record ID

    private User user;

    @Builder.Default
    private Boolean isLead = false;

    @Builder.Default
    private Boolean onMyWay = false;

    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();
}
