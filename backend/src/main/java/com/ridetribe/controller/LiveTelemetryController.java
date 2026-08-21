package com.ridetribe.controller;

import com.ridetribe.dto.GroupLocationsDTO;
import com.ridetribe.dto.LocationUpdateDTO;
import com.ridetribe.service.LiveTelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class LiveTelemetryController {

    private final LiveTelemetryService liveTelemetryService;

    /**
     * STOMP WebSocket Message Mapping:
     * CLIENT sends to: /app/ride-groups/{groupId}/location
     */
    @MessageMapping("/ride-groups/{groupId}/location")
    public void handleWebSocketLocation(
            @DestinationVariable("groupId") Long groupId,
            @Payload LocationUpdateDTO update) {
        update.setRideGroupId(groupId);
        liveTelemetryService.processLocationUpdate(update);
    }

    /**
     * REST Endpoint for location updates (fallback or simulator)
     */
    @PostMapping("/api/live/ride-groups/{groupId}/location")
    public ResponseEntity<GroupLocationsDTO> postLocationUpdate(
            @PathVariable("groupId") Long groupId,
            @RequestBody LocationUpdateDTO update) {
        update.setRideGroupId(groupId);
        GroupLocationsDTO groupLocs = liveTelemetryService.processLocationUpdate(update);
        return ResponseEntity.ok(groupLocs);
    }

    /**
     * REST Endpoint to get current cached locations for a group
     */
    @GetMapping("/api/live/ride-groups/{groupId}/locations")
    public ResponseEntity<GroupLocationsDTO> getGroupLocations(@PathVariable("groupId") Long groupId) {
        return ResponseEntity.ok(liveTelemetryService.getLatestGroupLocations(groupId));
    }
}
