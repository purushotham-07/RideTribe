package com.ridetribe.service;

import com.ridetribe.dto.GroupLocationsDTO;
import com.ridetribe.dto.LocationUpdateDTO;
import com.ridetribe.dto.RegroupAlertDTO;
import com.ridetribe.model.RideTelemetry;
import com.ridetribe.repository.RideTelemetryRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class LiveTelemetryService {

    private static final Logger logger = LoggerFactory.getLogger(LiveTelemetryService.class);

    public static final double REGROUP_DISTANCE_THRESHOLD_KM = 2.0;

    private final SimpMessagingTemplate messagingTemplate;
    private final RideTelemetryRepository rideTelemetryRepository;

    // In-memory store of latest locations: groupId -> (userId -> LocationUpdateDTO)
    private final Map<String, Map<String, LocationUpdateDTO>> groupLocationsCache = new ConcurrentHashMap<>();

    // Map to track when a rider started lagging: (groupId:userId) -> LocalDateTime
    private final Map<String, LocalDateTime> laggingTracker = new ConcurrentHashMap<>();

    /**
     * Process incoming telemetry ping from a client.
     */
    public GroupLocationsDTO processLocationUpdate(LocationUpdateDTO update) {
        String groupId = update.getRideGroupId();
        String userId = update.getUserId();

        if (groupId == null || userId == null || update.getLat() == null || update.getLng() == null) {
            return null;
        }

        update.setUpdatedAt(LocalDateTime.now());

        // Update in-memory location cache
        groupLocationsCache.computeIfAbsent(groupId, k -> new ConcurrentHashMap<>()).put(userId, update);

        // Async update dedicated RideTelemetry collection without document locking on RideGroup
        try {
            String compositeId = groupId + "_" + userId;
            RideTelemetry telemetry = RideTelemetry.builder()
                    .id(compositeId)
                    .rideGroupId(groupId)
                    .userId(userId)
                    .userName(update.getUserName())
                    .avatarUrl(update.getAvatarUrl())
                    .vehicleModel(update.getVehicleModel())
                    .lat(update.getLat())
                    .lng(update.getLng())
                    .speed(update.getSpeed())
                    .heading(update.getHeading())
                    .isLead(update.getIsLead())
                    .onMyWay(update.getOnMyWay())
                    .distanceFromLeadKm(update.getDistanceFromLeadKm())
                    .isLagging(update.getIsLagging())
                    .lastUpdated(LocalDateTime.now())
                    .build();
            rideTelemetryRepository.save(telemetry);
        } catch (Exception ignored) {
        }

        // Compute centroid and lead rider distance
        Map<String, LocationUpdateDTO> membersMap = groupLocationsCache.get(groupId);
        GroupLocationsDTO groupLocations = computeGroupLocations(groupId, membersMap);

        // Check for lagging riders and evaluate regroup alerts
        evaluateRegroupAlerts(groupId, groupLocations);

        // Broadcast to group STOMP destination: /topic/ride-groups/{groupId}/locations
        messagingTemplate.convertAndSend("/topic/ride-groups/" + groupId + "/locations", groupLocations);

        return groupLocations;
    }

    public GroupLocationsDTO getLatestGroupLocations(String groupId) {
        Map<String, LocationUpdateDTO> membersMap = groupLocationsCache.get(groupId);
        if (membersMap == null || membersMap.isEmpty()) {
            // Populate from RideTelemetry collection if cache is empty
            membersMap = new ConcurrentHashMap<>();
            List<RideTelemetry> dbTelemetry = rideTelemetryRepository.findByRideGroupId(groupId);
            for (RideTelemetry t : dbTelemetry) {
                if (t.getLat() != null && t.getLng() != null) {
                    LocationUpdateDTO dto = LocationUpdateDTO.builder()
                            .userId(t.getUserId())
                            .userName(t.getUserName())
                            .avatarUrl(t.getAvatarUrl())
                            .vehicleModel(t.getVehicleModel())
                            .rideGroupId(groupId)
                            .lat(t.getLat())
                            .lng(t.getLng())
                            .speed(t.getSpeed() != null ? t.getSpeed() : 0.0)
                            .heading(t.getHeading() != null ? t.getHeading() : 0.0)
                            .onMyWay(t.getOnMyWay())
                            .isLead(t.getIsLead())
                            .distanceFromLeadKm(t.getDistanceFromLeadKm())
                            .isLagging(t.getIsLagging())
                            .updatedAt(t.getLastUpdated() != null ? t.getLastUpdated() : LocalDateTime.now())
                            .build();
                    membersMap.put(t.getUserId(), dto);
                }
            }
            groupLocationsCache.put(groupId, membersMap);
        }
        return computeGroupLocations(groupId, membersMap);
    }

    private GroupLocationsDTO computeGroupLocations(String groupId, Map<String, LocationUpdateDTO> membersMap) {
        if (membersMap == null || membersMap.isEmpty()) {
            return GroupLocationsDTO.builder()
                    .rideGroupId(groupId)
                    .locations(Collections.emptyMap())
                    .build();
        }

        double totalLat = 0;
        double totalLng = 0;
        int count = 0;
        String leadId = null;
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

    private void evaluateRegroupAlerts(String groupId, GroupLocationsDTO groupLocations) {
        if (groupLocations.getLocations() == null) return;

        for (LocationUpdateDTO loc : groupLocations.getLocations().values()) {
            String trackerKey = groupId + ":" + loc.getUserId();

            if (Boolean.TRUE.equals(loc.getIsLagging())) {
                laggingTracker.computeIfAbsent(trackerKey, k -> LocalDateTime.now());

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

                messagingTemplate.convertAndSend("/topic/ride-groups/" + groupId + "/regroup-alert", alert);
            } else {
                laggingTracker.remove(trackerKey);
            }
        }
    }

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
