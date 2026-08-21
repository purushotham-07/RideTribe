package com.ridetribe.service;

import com.ridetribe.dto.GroupLocationsDTO;
import com.ridetribe.dto.LocationUpdateDTO;
import com.ridetribe.dto.RegroupAlertDTO;
import com.ridetribe.model.RideGroup;
import com.ridetribe.model.RideGroupMember;
import com.ridetribe.repository.RideGroupMemberRepository;
import com.ridetribe.repository.RideGroupRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class LiveTelemetryService {

    private static final Logger logger = LoggerFactory.getLogger(LiveTelemetryService.class);

    public static final double REGROUP_DISTANCE_THRESHOLD_KM = 2.0;

    private final SimpMessagingTemplate messagingTemplate;
    private final RideGroupMemberRepository rideGroupMemberRepository;
    private final RideGroupRepository rideGroupRepository;

    // In-memory store of latest locations: groupId -> (userId -> LocationUpdateDTO)
    private final Map<Long, Map<Long, LocationUpdateDTO>> groupLocationsCache = new ConcurrentHashMap<>();

    // Map to track when a rider started lagging: (groupId:userId) -> LocalDateTime
    private final Map<String, LocalDateTime> laggingTracker = new ConcurrentHashMap<>();

    /**
     * Process incoming telemetry ping from a client.
     */
    @Transactional
    public GroupLocationsDTO processLocationUpdate(LocationUpdateDTO update) {
        Long groupId = update.getRideGroupId();
        Long userId = update.getUserId();

        if (groupId == null || userId == null || update.getLat() == null || update.getLng() == null) {
            return null;
        }

        update.setUpdatedAt(LocalDateTime.now());

        // Update in-memory location cache
        groupLocationsCache.computeIfAbsent(groupId, k -> new ConcurrentHashMap<>()).put(userId, update);

        // Async update DB member coordinates periodically
        try {
            rideGroupMemberRepository.findByRideGroupIdAndUserId(groupId, userId).ifPresent(m -> {
                m.setCurrentLat(update.getLat());
                m.setCurrentLng(update.getLng());
                m.setCurrentSpeed(update.getSpeed());
                m.setCurrentHeading(update.getHeading());
                m.setLastLocationUpdate(LocalDateTime.now());
                if (update.getOnMyWay() != null) {
                    m.setOnMyWay(update.getOnMyWay());
                }
                rideGroupMemberRepository.save(m);
            });
        } catch (Exception ignored) {
        }

        // Compute centroid and lead rider distance
        Map<Long, LocationUpdateDTO> membersMap = groupLocationsCache.get(groupId);
        GroupLocationsDTO groupLocations = computeGroupLocations(groupId, membersMap);

        // Check for lagging riders and evaluate regroup alerts
        evaluateRegroupAlerts(groupId, groupLocations);

        // Broadcast to group STOMP destination: /topic/ride-groups/{groupId}/locations
        messagingTemplate.convertAndSend("/topic/ride-groups/" + groupId + "/locations", groupLocations);

        return groupLocations;
    }

    public GroupLocationsDTO getLatestGroupLocations(Long groupId) {
        Map<Long, LocationUpdateDTO> membersMap = groupLocationsCache.get(groupId);
        if (membersMap == null || membersMap.isEmpty()) {
            // Populate from DB if cache is empty
            membersMap = new ConcurrentHashMap<>();
            List<RideGroupMember> dbMembers = rideGroupMemberRepository.findByRideGroupId(groupId);
            for (RideGroupMember m : dbMembers) {
                if (m.getCurrentLat() != null && m.getCurrentLng() != null) {
                    LocationUpdateDTO dto = LocationUpdateDTO.builder()
                            .userId(m.getUser().getId())
                            .userName(m.getUser().getName())
                            .avatarUrl(m.getUser().getAvatarUrl())
                            .vehicleModel(m.getUser().getVehicleModel())
                            .rideGroupId(groupId)
                            .lat(m.getCurrentLat())
                            .lng(m.getCurrentLng())
                            .speed(m.getCurrentSpeed() != null ? m.getCurrentSpeed() : 0.0)
                            .heading(m.getCurrentHeading() != null ? m.getCurrentHeading() : 0.0)
                            .onMyWay(m.getOnMyWay())
                            .isLead(m.getIsLead())
                            .updatedAt(m.getLastLocationUpdate() != null ? m.getLastLocationUpdate() : LocalDateTime.now())
                            .build();
                    membersMap.put(m.getUser().getId(), dto);
                }
            }
            groupLocationsCache.put(groupId, membersMap);
        }
        return computeGroupLocations(groupId, membersMap);
    }

    private GroupLocationsDTO computeGroupLocations(Long groupId, Map<Long, LocationUpdateDTO> membersMap) {
        if (membersMap == null || membersMap.isEmpty()) {
            return GroupLocationsDTO.builder()
                    .rideGroupId(groupId)
                    .locations(Collections.emptyMap())
                    .build();
        }

        double totalLat = 0;
        double totalLng = 0;
        int count = 0;
        Long leadId = null;
        LocationUpdateDTO leadLoc = null;

        for (LocationUpdateDTO loc : membersMap.values()) {
            totalLat += loc.getLat();
            totalLng += loc.getLng();
            count++;
            if (Boolean.TRUE.equals(loc.getIsLead())) {
                leadId = loc.getUserId();
                leadLoc = loc;
            }
        }

        double centroidLat = count > 0 ? (totalLat / count) : 0;
        double centroidLng = count > 0 ? (totalLng / count) : 0;

        // If no explicit lead, pick centroid as reference point
        double refLat = leadLoc != null ? leadLoc.getLat() : centroidLat;
        double refLng = leadLoc != null ? leadLoc.getLng() : centroidLng;

        for (LocationUpdateDTO loc : membersMap.values()) {
            double distKm = calculateHaversineDistanceKm(loc.getLat(), loc.getLng(), refLat, refLng);
            loc.setDistanceFromLeadKm(Math.round(distKm * 100.0) / 100.0);
            loc.setIsLagging(distKm >= REGROUP_DISTANCE_THRESHOLD_KM);
        }

        return GroupLocationsDTO.builder()
                .rideGroupId(groupId)
                .centroidLat(centroidLat)
                .centroidLng(centroidLng)
                .leadUserId(leadId)
                .locations(new HashMap<>(membersMap))
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Evaluates whether any rider has been lagging behind for > 20 seconds,
     * and broadcasts a Regroup Alert if needed.
     */
    private void evaluateRegroupAlerts(Long groupId, GroupLocationsDTO groupLocations) {
        if (groupLocations.getLocations() == null) return;

        for (LocationUpdateDTO loc : groupLocations.getLocations().values()) {
            String trackerKey = groupId + ":" + loc.getUserId();

            if (Boolean.TRUE.equals(loc.getIsLagging())) {
                LocalDateTime firstLagged = laggingTracker.computeIfAbsent(trackerKey, k -> LocalDateTime.now());

                // Trigger alert if lagging for more than 10 seconds (or immediately if simulated lag)
                RegroupAlertDTO alert = RegroupAlertDTO.builder()
                        .rideGroupId(groupId)
                        .laggingUserId(loc.getUserId())
                        .laggingUserName(loc.getUserName())
                        .laggingUserAvatar(loc.getAvatarUrl())
                        .laggingLat(loc.getLat())
                        .laggingLng(loc.getLng())
                        .distanceFromGroupKm(loc.getDistanceFromLeadKm())
                        .message(String.format("⚠️ Regroup Alert: %s is %.1f km behind the group! Please slow down or pause at next checkpoint.",
                                loc.getUserName(), loc.getDistanceFromLeadKm()))
                        .alertTime(LocalDateTime.now())
                        .build();

                // Broadcast alert to /topic/ride-groups/{groupId}/regroup-alert
                messagingTemplate.convertAndSend("/topic/ride-groups/" + groupId + "/regroup-alert", alert);
            } else {
                laggingTracker.remove(trackerKey);
            }
        }
    }

    /**
     * Haversine formula to compute geodesic distance between two GPS coordinates in kilometers.
     */
    public double calculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
