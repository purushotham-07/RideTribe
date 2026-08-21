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
    private Long id;
    private Long rideGroupId;
    private UserDTO rater;
    private UserDTO ratee;
    private Integer stars;
    private Boolean wouldRideAgain;
    private String tags;
    private String comment;
    private LocalDateTime createdAt;

    public static RatingDTO fromEntity(Rating rating) {
        if (rating == null) return null;
        return RatingDTO.builder()
                .id(rating.getId())
                .rideGroupId(rating.getRideGroup() != null ? rating.getRideGroup().getId() : null)
                .rater(UserDTO.fromEntity(rating.getRater()))
                .ratee(UserDTO.fromEntity(rating.getRatee()))
                .stars(rating.getStars())
                .wouldRideAgain(rating.getWouldRideAgain())
                .tags(rating.getTags())
                .comment(rating.getComment())
                .createdAt(rating.getCreatedAt())
                .build();
    }
}
