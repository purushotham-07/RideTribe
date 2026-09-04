package com.ridetribe.dto;

import com.ridetribe.model.Rating;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingDTO {
    private String id;
    private String rideGroupId;
    private UserDTO rater;
    private UserDTO ratee;
    private Double score;
    private String comment;
    private LocalDateTime createdAt;

    public static RatingDTO fromEntity(Rating rating) {
        if (rating == null) return null;
        return RatingDTO.builder()
                .id(rating.getId())
                .rideGroupId(rating.getRideGroupId())
                .rater(UserDTO.fromEntity(rating.getRater()))
                .ratee(UserDTO.fromEntity(rating.getRatee()))
                .score(rating.getScore())
                .comment(rating.getComment())
                .createdAt(rating.getCreatedAt())
                .build();
    }
}
