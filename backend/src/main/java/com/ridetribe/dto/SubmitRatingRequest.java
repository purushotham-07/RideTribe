package com.ridetribe.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitRatingRequest {
    @NotNull
    private Long rideGroupId;

    @NotNull
    private Long rateeId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer stars;

    private Boolean wouldRideAgain;
    private String tags; // e.g. "Great Lead, Safe Rider, Punctual"
    private String comment;
}
