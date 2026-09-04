package com.ridetribe.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SosTriggerRequest {
    @NotNull
    private String rideGroupId;

    private Double lat;
    private Double lng;
    private String notes;
}
