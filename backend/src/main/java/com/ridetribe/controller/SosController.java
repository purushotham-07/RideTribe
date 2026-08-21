package com.ridetribe.controller;

import com.ridetribe.dto.SosAlertDTO;
import com.ridetribe.dto.SosTriggerRequest;
import com.ridetribe.model.SosEvent;
import com.ridetribe.service.SosService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class SosController {

    private final SosService sosService;

    @PostMapping
    public ResponseEntity<SosAlertDTO> triggerSos(@Valid @RequestBody SosTriggerRequest request) {
        return ResponseEntity.ok(sosService.triggerSos(request));
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<SosEvent> resolveSos(@PathVariable("id") Long id) {
        return ResponseEntity.ok(sosService.resolveSos(id));
    }

    @GetMapping("/group/{groupId}/active")
    public ResponseEntity<List<SosEvent>> getActiveSos(@PathVariable("groupId") Long groupId) {
        return ResponseEntity.ok(sosService.getActiveSosEvents(groupId));
    }

    /**
     * STOMP WebSocket Message Mapping for direct in-ride SOS beacon:
     * CLIENT sends to: /app/ride-groups/{groupId}/sos
     */
    @MessageMapping("/ride-groups/{groupId}/sos")
    public void handleWebSocketSos(
            @DestinationVariable("groupId") Long groupId,
            @Payload SosTriggerRequest request) {
        request.setRideGroupId(groupId);
        sosService.triggerSos(request);
    }
}
