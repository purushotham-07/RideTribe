package com.ridetribe.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ManualMatchRequest {
    private LocalDate rideDate;
    private String destination;
}
