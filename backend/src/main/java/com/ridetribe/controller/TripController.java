package com.ridetribe.controller;

import com.ridetribe.dto.*;
import com.ridetribe.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripDTO> createTrip(@Valid @RequestBody CreateTripRequest request) {
        TripDTO created = tripService.createTrip(request);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<TripDTO>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripDTO> getTripById(@PathVariable String id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @PostMapping("/{id}/join-requests")
    public ResponseEntity<TripJoinRequestDTO> sendJoinRequest(
            @PathVariable String id,
            @RequestBody(required = false) SendJoinRequestDTO request) {
        TripJoinRequestDTO created = tripService.sendJoinRequest(id, request);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{id}/join-requests")
    public ResponseEntity<List<TripJoinRequestDTO>> getTripJoinRequests(@PathVariable String id) {
        return ResponseEntity.ok(tripService.getTripJoinRequests(id));
    }

    @PatchMapping("/{id}/join-requests/{requestId}")
    public ResponseEntity<TripJoinRequestDTO> respondToJoinRequest(
            @PathVariable String id,
            @PathVariable String requestId,
            @Valid @RequestBody RespondJoinRequestDTO response) {
        TripJoinRequestDTO updated = tripService.respondToJoinRequest(id, requestId, response);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/chat")
    public ResponseEntity<List<TripChatMessageDTO>> getTripChatMessages(@PathVariable String id) {
        return ResponseEntity.ok(tripService.getTripChatMessages(id));
    }

    @PostMapping("/{id}/chat")
    public ResponseEntity<TripChatMessageDTO> sendTripChatMessage(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String content = payload.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        TripChatMessageDTO sent = tripService.sendTripChatMessage(id, content.trim());
        return ResponseEntity.ok(sent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTrip(@PathVariable String id) {
        tripService.deleteTrip(id);
        return ResponseEntity.ok(Map.of("message", "Trip deleted successfully"));
    }
}
