package com.ridetribe.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitRatingRequest {
    @NotNull
    private String rideGroupId;

    @NotNull
    private String rateeId;

    @NotNull
    @DecimalMin("1.0")
    @DecimalMax("5.0")
    private Double score;

    private String comment;
}
