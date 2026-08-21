package com.ridetribe.controller;

import com.ridetribe.dto.RideGroupDTO;
import com.ridetribe.dto.UpdateMemberStatusRequest;
import com.ridetribe.service.RideGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ride-groups")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class RideGroupController {

    private final RideGroupService rideGroupService;

    @GetMapping("/{id}")
    public ResponseEntity<RideGroupDTO> getGroupById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(rideGroupService.getGroupById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<List<RideGroupDTO>> getMyGroups() {
        return ResponseEntity.ok(rideGroupService.getMyRideGroups());
    }

    @GetMapping
    public ResponseEntity<List<RideGroupDTO>> getAllGroups() {
        return ResponseEntity.ok(rideGroupService.getAllGroups());
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<RideGroupDTO> startRide(@PathVariable("id") Long id) {
        return ResponseEntity.ok(rideGroupService.startRide(id));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<RideGroupDTO> completeRide(@PathVariable("id") Long id) {
        return ResponseEntity.ok(rideGroupService.completeRide(id));
    }

    @PatchMapping("/{id}/members/status")
    public ResponseEntity<RideGroupDTO> updateMemberStatus(
            @PathVariable("id") Long id,
            @RequestBody UpdateMemberStatusRequest request) {
        return ResponseEntity.ok(rideGroupService.updateMemberStatus(id, request));
    }
}
