package com.ridetribe.dto;

import com.ridetribe.model.TravelMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTripRequest {
    @NotBlank
    private String title; // e.g. "Sunrise Coffee Tour to Nandi Hills"

    private String description;

    @NotBlank
    private String destination;

    @NotNull
    private TravelMode travelMode;

    @NotNull
    private LocalDate rideDate;

    @NotNull
    private LocalTime scheduledTime;

    private Integer numberOfDays; // e.g. 1, 2, 3

    private Integer maxMembers; // e.g. 5

    private String whatToCarry; // e.g. "Full-face helmet, Rain jacket, Puncture kit, Hydration pack"

    private String coverImageUrl;

    // Meeting pin location
    private String meetingPointName;
    private Double meetingPointLat;
    private Double meetingPointLng;

    private Double destinationLat;
    private Double destinationLng;
    private Double estimatedDistanceKm;
}
