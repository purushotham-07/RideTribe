package com.ridetribe.controller;

import com.ridetribe.dto.CreateRideIntentRequest;
import com.ridetribe.dto.RideIntentDTO;
import com.ridetribe.service.RideIntentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ride-intents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class RideIntentController {

    private final RideIntentService rideIntentService;

    @PostMapping
    public ResponseEntity<RideIntentDTO> createRideIntent(@Valid @RequestBody CreateRideIntentRequest request) {
        return ResponseEntity.ok(rideIntentService.createIntent(request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<RideIntentDTO>> getMyRideIntents() {
        return ResponseEntity.ok(rideIntentService.getMyIntents());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<RideIntentDTO>> getAllPendingIntents() {
        return ResponseEntity.ok(rideIntentService.getAllPendingIntents());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<RideIntentDTO> cancelRideIntent(@PathVariable("id") Long id) {
        return ResponseEntity.ok(rideIntentService.cancelIntent(id));
    }
}
