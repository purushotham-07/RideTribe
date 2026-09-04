package com.ridetribe.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "peer_ratings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rating {

    @Id
    private String id;

    @Indexed
    private String rideGroupId;

    @Indexed
    private String raterId;

    private User rater;

    @Indexed
    private String rateeId;

    private User ratee;

    private Double score;

    private String comment;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
