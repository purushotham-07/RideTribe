package com.ridetribe.dto;

import com.ridetribe.model.Pace;
import com.ridetribe.model.TravelMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateRideIntentRequest {
    @NotBlank
    private String destination;

    @NotNull
    private TravelMode travelMode;

    private Pace pace;

    @NotNull
    private LocalDate rideDate;

    @NotNull
    private LocalTime windowStartTime;

    @NotNull
    private LocalTime windowEndTime;

    private String startingArea;
    private String notes;
}
