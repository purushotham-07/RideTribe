package com.ridetribe.service;

import com.ridetribe.dto.MatchingClusterDTO;
import com.ridetribe.dto.MatchingSummaryDTO;
import com.ridetribe.dto.UserDTO;
import com.ridetribe.model.*;
import com.ridetribe.repository.RatingRepository;
import com.ridetribe.repository.RideGroupRepository;
import com.ridetribe.repository.RideIntentRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingEngineService {

    private static final Logger logger = LoggerFactory.getLogger(MatchingEngineService.class);

    public static final int MIN_GROUP_SIZE = 3;
    public static final int MAX_GROUP_SIZE = 6;
    public static final double COMPATIBILITY_THRESHOLD = 50.0;

    private final RideIntentRepository rideIntentRepository;
    private final RideGroupRepository rideGroupRepository;
    private final RatingRepository ratingRepository;

    @Scheduled(cron = "0 0 18 * * FRI")
    public void runScheduledWeekendMatching() {
        logger.info("Triggering scheduled weekend matching job...");
        LocalDate upcomingSaturday = LocalDate.now().plusDays((6 - LocalDate.now().getDayOfWeek().getValue() + 7) % 7);
        LocalDate upcomingSunday = upcomingSaturday.plusDays(1);

        executeMatching(upcomingSaturday, null);
        executeMatching(upcomingSunday, null);
    }

    public MatchingSummaryDTO executeMatching(LocalDate targetDate, String targetDestination) {
        logger.info("Starting RideTribe Matching Engine. Target Date: {}, Destination: {}", targetDate, targetDestination);

        List<RideIntent> pendingIntents;
        if (targetDate != null && targetDestination != null && !targetDestination.isBlank()) {
            pendingIntents = new ArrayList<>(rideIntentRepository.findByDestinationIgnoreCaseAndTravelModeAndStatusAndRideDate(
                    targetDestination, TravelMode.BIKE, RideIntentStatus.PENDING, targetDate));
            pendingIntents.addAll(rideIntentRepository.findByDestinationIgnoreCaseAndTravelModeAndStatusAndRideDate(
                    targetDestination, TravelMode.CAR, RideIntentStatus.PENDING, targetDate));
        } else if (targetDate != null) {
            pendingIntents = rideIntentRepository.findByStatusAndRideDate(RideIntentStatus.PENDING, targetDate);
        } else {
            pendingIntents = rideIntentRepository.findByStatus(RideIntentStatus.PENDING);
        }

        if (pendingIntents.isEmpty()) {
            logger.info("No pending ride intents found to match.");
            return MatchingSummaryDTO.builder()
                    .totalIntentsProcessed(0)
                    .totalUsersMatched(0)
                    .totalGroupsFormed(0)
                    .unmergedPendingIntents(0)
                    .formedGroups(Collections.emptyList())
                    .executionMessage("No pending intents found for matching.")
                    .build();
        }

        logger.info("Found {} pending intents to process.", pendingIntents.size());

        Map<String, List<RideIntent>> candidatePools = pendingIntents.stream()
                .collect(Collectors.groupingBy(intent ->
                        intent.getDestination().trim().toLowerCase() + "::" +
                        intent.getRideDate().toString() + "::" +
                        intent.getTravelMode().name()
                ));

        List<MatchingClusterDTO> formedClusterDTOs = new ArrayList<>();
        int totalMatchedCount = 0;
        int totalGroupsFormed = 0;

        for (Map.Entry<String, List<RideIntent>> poolEntry : candidatePools.entrySet()) {
            List<RideIntent> pool = poolEntry.getValue();
            if (pool.size() < MIN_GROUP_SIZE) {
                logger.info("Candidate pool [{}] has {} intents (< MIN_GROUP_SIZE {}). Skipping.",
                        poolEntry.getKey(), pool.size(), MIN_GROUP_SIZE);
                continue;
            }

            List<MatchingClusterDTO> clusters = matchPool(pool);
            formedClusterDTOs.addAll(clusters);
            for (MatchingClusterDTO c : clusters) {
                totalMatchedCount += c.getMatchedUsers().size();
                totalGroupsFormed++;
            }
        }

        int unmerged = pendingIntents.size() - totalMatchedCount;

        String summaryMsg = String.format("Matching completed: Formed %d groups matching %d riders out of %d candidates (%d pending).",
                totalGroupsFormed, totalMatchedCount, pendingIntents.size(), unmerged);
        logger.info(summaryMsg);

        return MatchingSummaryDTO.builder()
                .totalIntentsProcessed(pendingIntents.size())
                .totalUsersMatched(totalMatchedCount)
                .totalGroupsFormed(totalGroupsFormed)
                .unmergedPendingIntents(unmerged)
                .formedGroups(formedClusterDTOs)
                .executionMessage(summaryMsg)
                .build();
    }

    private List<MatchingClusterDTO> matchPool(List<RideIntent> intents) {
        int n = intents.size();
        DisjointSetUnion uf = new DisjointSetUnion(n, MAX_GROUP_SIZE);

        List<CompatibilityEdge> edges = new ArrayList<>();

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                RideIntent a = intents.get(i);
                RideIntent b = intents.get(j);

                if (a.getUser() != null && b.getUser() != null && a.getUser().getId().equals(b.getUser().getId())) {
                    continue;
                }

                double score = computePairwiseCompatibility(a, b);
                if (score >= COMPATIBILITY_THRESHOLD) {
                    edges.add(new CompatibilityEdge(i, j, score));
                }
            }
        }

        edges.sort((e1, e2) -> Double.compare(e2.score, e1.score));

        for (CompatibilityEdge edge : edges) {
            uf.union(edge.u, edge.v);
        }

        Map<Integer, List<Integer>> rootToMembers = uf.getClusters();
        List<MatchingClusterDTO> resultClusters = new ArrayList<>();

        for (Map.Entry<Integer, List<Integer>> entry : rootToMembers.entrySet()) {
            List<Integer> memberIndices = entry.getValue();

            if (memberIndices.size() >= MIN_GROUP_SIZE) {
                List<RideIntent> matchedIntents = memberIndices.stream()
                        .map(intents::get)
                        .collect(Collectors.toList());

                RideGroup formedGroup = persistRideGroup(matchedIntents);
                double avgScore = calculateClusterAvgScore(memberIndices, edges);

                List<UserDTO> userDTOs = matchedIntents.stream()
                        .map(intent -> UserDTO.fromEntity(intent.getUser()))
                        .collect(Collectors.toList());

                resultClusters.add(MatchingClusterDTO.builder()
                        .rideGroupId(formedGroup.getId())
                        .destination(formedGroup.getDestination())
                        .travelMode(formedGroup.getTravelMode())
                        .rideDate(formedGroup.getRideDate())
                        .scheduledTime(formedGroup.getScheduledTime())
                        .meetingPointName(formedGroup.getMeetingPointName())
                        .matchedUsers(userDTOs)
                        .averageCompatibilityScore(Math.round(avgScore * 10.0) / 10.0)
                        .build());
            }
        }

        return resultClusters;
    }

    public double computePairwiseCompatibility(RideIntent a, RideIntent b) {
        double timeScore = computeTimeWindowOverlapScore(a, b);
        if (timeScore <= 0.0) {
            return 0.0;
        }

        double paceScore = 0.0;
        if (a.getPace() != null && b.getPace() != null) {
            if (a.getPace() == b.getPace()) {
                paceScore = 25.0;
            } else if (Math.abs(a.getPace().ordinal() - b.getPace().ordinal()) == 1) {
                paceScore = 15.0;
            } else {
                paceScore = 5.0;
            }
        } else {
            paceScore = 20.0;
        }

        double locationScore = 10.0;
        if (a.getStartingArea() != null && b.getStartingArea() != null) {
            if (a.getStartingArea().trim().equalsIgnoreCase(b.getStartingArea().trim())) {
                locationScore = 15.0;
            } else if (isNearbyBangaloreArea(a.getStartingArea(), b.getStartingArea())) {
                locationScore = 12.0;
            }
        }

        return timeScore * 0.50 + paceScore + locationScore;
    }

    public double computeTimeWindowOverlapScore(RideIntent a, RideIntent b) {
        LocalTime startA = a.getWindowStartTime();
        LocalTime endA = a.getWindowEndTime();
        LocalTime startB = b.getWindowStartTime();
        LocalTime endB = b.getWindowEndTime();

        if (startA == null || endA == null || startB == null || endB == null) {
            return 50.0;
        }

        LocalTime overlapStart = startA.isAfter(startB) ? startA : startB;
        LocalTime overlapEnd = endA.isBefore(endB) ? endA : endB;

        if (!overlapStart.isBefore(overlapEnd)) {
            return 0.0;
        }

        long overlapMinutes = Duration.between(overlapStart, overlapEnd).toMinutes();
        long durationA = Duration.between(startA, endA).toMinutes();
        long durationB = Duration.between(startB, endB).toMinutes();
        long minDuration = Math.min(durationA, durationB);

        if (minDuration <= 0) return 0.0;

        double overlapRatio = (double) overlapMinutes / minDuration;
        return Math.min(100.0, overlapRatio * 100.0);
    }

    private boolean isNearbyBangaloreArea(String area1, String area2) {
        String a1 = area1.toLowerCase();
        String a2 = area2.toLowerCase();
        Set<String> northBangalore = Set.of("hebbal", "sahakar nagar", "yelahanka", "manyata", "rt nagar");
        Set<String> eastBangalore = Set.of("indiranagar", "koramangala", "hsr layout", "whitefield", "bellandur", "marathahalli");
        Set<String> southBangalore = Set.of("jayanagar", "jp nagar", "banashankari", "btm layout", "electronic city");
        Set<String> westBangalore = Set.of("malleshwaram", "rajajinagar", "vijayanagar", "yeshwantpur");

        return (northBangalore.contains(a1) && northBangalore.contains(a2)) ||
               (eastBangalore.contains(a1) && eastBangalore.contains(a2)) ||
               (southBangalore.contains(a1) && southBangalore.contains(a2)) ||
               (westBangalore.contains(a1) && westBangalore.contains(a2));
    }

    private double calculateClusterAvgScore(List<Integer> members, List<CompatibilityEdge> edges) {
        Set<Integer> memberSet = new HashSet<>(members);
        double total = 0;
        int count = 0;
        for (CompatibilityEdge e : edges) {
            if (memberSet.contains(e.u) && memberSet.contains(e.v)) {
                total += e.score;
                count++;
            }
        }
        return count > 0 ? (total / count) : 80.0;
    }

    public RideGroup persistRideGroup(List<RideIntent> matchedIntents) {
        RideIntent first = matchedIntents.get(0);
        String destination = first.getDestination();
        TravelMode travelMode = first.getTravelMode();
        LocalDate rideDate = first.getRideDate();

        LocalTime maxStart = matchedIntents.stream()
                .map(RideIntent::getWindowStartTime)
                .filter(Objects::nonNull)
                .max(LocalTime::compareTo)
                .orElse(LocalTime.of(6, 0));

        BangaloreRouteInfo routeInfo = resolveRouteInfo(destination);

        List<RideGroupMember> memberList = new ArrayList<>();
        boolean isFirst = true;
        for (RideIntent intent : matchedIntents) {
            RideGroupMember member = RideGroupMember.builder()
                    .id(new ObjectId().toHexString())
                    .user(intent.getUser())
                    .isLead(isFirst)
                    .onMyWay(false)
                    .joinedAt(LocalDateTime.now())
                    .build();
            memberList.add(member);
            isFirst = false;
        }

        User hostUser = matchedIntents.get(0).getUser();

        RideGroup group = RideGroup.builder()
                .title("Convoy to " + destination)
                .hostUser(hostUser)
                .destination(destination)
                .travelMode(travelMode)
                .rideDate(rideDate)
                .scheduledTime(maxStart)
                .numberOfDays(1)
                .maxMembers(MAX_GROUP_SIZE)
                .whatToCarry("Full-face helmet, Rain gear, Basic toolkit, Hydration pack")
                .meetingPointName(routeInfo.meetingPointName)
                .meetingPointLat(routeInfo.meetingPointLat)
                .meetingPointLng(routeInfo.meetingPointLng)
                .destinationLat(routeInfo.destinationLat)
                .destinationLng(routeInfo.destinationLng)
                .estimatedDistanceKm(routeInfo.estimatedDistanceKm)
                .status(RideGroupStatus.CONFIRMED)
                .members(memberList)
                .requests(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();

        RideGroup savedGroup = rideGroupRepository.save(group);

        for (RideIntent intent : matchedIntents) {
            intent.setStatus(RideIntentStatus.MATCHED);
            rideIntentRepository.save(intent);
        }

        return savedGroup;
    }

    public BangaloreRouteInfo resolveRouteInfo(String destination) {
        String dest = destination.toLowerCase().trim();
        if (dest.contains("nandi")) {
            return new BangaloreRouteInfo("Esteem Mall, Hebbal Flyover (Airport Rd)", 13.0428, 77.5912, 13.3702, 77.6835, 60.0);
        } else if (dest.contains("coorg") || dest.contains("madikeri")) {
            return new BangaloreRouteInfo("Nelamangala Toll Plaza (NH 48 / Hassan Rd)", 13.0973, 77.3912, 12.4244, 75.7382, 260.0);
        } else if (dest.contains("chikmagalur") || dest.contains("chikkamagaluru")) {
            return new BangaloreRouteInfo("Nelamangala Toll Plaza (NH 48)", 13.0973, 77.3912, 13.3161, 75.7720, 245.0);
        } else if (dest.contains("lepakshi")) {
            return new BangaloreRouteInfo("Hebbal Flyover Service Road", 13.0428, 77.5912, 13.8042, 77.6053, 125.0);
        } else if (dest.contains("skandagiri")) {
            return new BangaloreRouteInfo("Esteem Mall, Hebbal", 13.0428, 77.5912, 13.4183, 77.6832, 65.0);
        } else if (dest.contains("wayanad")) {
            return new BangaloreRouteInfo("Kengeri Metro Station / NICE Junction (Mysore Rd)", 12.9103, 77.4839, 11.6854, 76.1320, 280.0);
        } else if (dest.contains("ooty")) {
            return new BangaloreRouteInfo("NICE Road Mysore Road Junction", 12.8942, 77.4720, 11.4102, 76.6950, 275.0);
        } else {
            return new BangaloreRouteInfo("Cubbon Park / MG Road Rendezvous Checkpoint", 12.9716, 77.5946, 12.9716, 77.5946, 80.0);
        }
    }

    @Data
    @AllArgsConstructor
    public static class CompatibilityEdge {
        int u;
        int v;
        double score;
    }

    @Data
    @AllArgsConstructor
    public static class BangaloreRouteInfo {
        String meetingPointName;
        Double meetingPointLat;
        Double meetingPointLng;
        Double destinationLat;
        Double destinationLng;
        Double estimatedDistanceKm;
    }

    public static class DisjointSetUnion {
        private final int[] parent;
        private final int[] size;
        private final int maxSize;

        public DisjointSetUnion(int n, int maxSize) {
            this.maxSize = maxSize;
            this.parent = new int[n];
            this.size = new int[n];
            for (int i = 0; i < n; i++) {
                parent[i] = i;
                size[i] = 1;
            }
        }

        public int find(int i) {
            if (parent[i] == i) {
                return i;
            }
            return parent[i] = find(parent[i]);
        }

        public boolean union(int i, int j) {
            int rootI = find(i);
            int rootJ = find(j);

            if (rootI == rootJ) {
                return false;
            }

            if (size[rootI] + size[rootJ] > maxSize) {
                return false;
            }

            if (size[rootI] < size[rootJ]) {
                parent[rootI] = rootJ;
                size[rootJ] += size[rootI];
            } else {
                parent[rootJ] = rootI;
                size[rootI] += size[rootJ];
            }
            return true;
        }

        public int getSize(int i) {
            return size[find(i)];
        }

        public Map<Integer, List<Integer>> getClusters() {
            Map<Integer, List<Integer>> clusters = new HashMap<>();
            for (int i = 0; i < parent.length; i++) {
                int root = find(i);
                clusters.computeIfAbsent(root, k -> new ArrayList<>()).add(i);
            }
            return clusters;
        }
    }
}
