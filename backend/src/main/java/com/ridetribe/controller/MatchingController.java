package com.ridetribe.controller;

import com.ridetribe.dto.ManualMatchRequest;
import com.ridetribe.dto.MatchingSummaryDTO;
import com.ridetribe.service.MatchingEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/matching")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class MatchingController {

    private final MatchingEngineService matchingEngineService;

    /**
     * Manual endpoint to run the matching engine for testing, demo, or immediate matching.
     */
    @PostMapping("/run")
    public ResponseEntity<MatchingSummaryDTO> runMatching(
            @RequestBody(required = false) ManualMatchRequest request) {

        LocalDate date = request != null ? request.getRideDate() : null;
        String destination = request != null ? request.getDestination() : null;

        MatchingSummaryDTO summary = matchingEngineService.executeMatching(date, destination);
        return ResponseEntity.ok(summary);
    }
}
