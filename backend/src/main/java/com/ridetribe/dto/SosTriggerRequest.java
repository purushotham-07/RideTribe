package com.ridetribe.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SosTriggerRequest {
    @NotNull
    private Long rideGroupId;
    private Double lat;
    private Double lng;
    private String notes;
}
