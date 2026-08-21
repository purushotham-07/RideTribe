package com.ridetribe.service;

import com.ridetribe.dto.MatchingClusterDTO;
import com.ridetribe.dto.MatchingSummaryDTO;
import com.ridetribe.dto.UserDTO;
import com.ridetribe.model.*;
import com.ridetribe.repository.RatingRepository;
import com.ridetribe.repository.RideGroupMemberRepository;
import com.ridetribe.repository.RideGroupRepository;
import com.ridetribe.repository.RideIntentRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * MatchingEngineService - Algorithmic Core of RideTribe
 *
 * Implements a Greedy Graph-Clustering algorithm using Disjoint Set (Union-Find)
 * to group solo riders into optimal peer groups of 3 to 6 members.
 *
 * Matching Process:
 * 1. Partition candidate pool by (Destination, RideDate, TravelMode).
 * 2. Calculate pairwise compatibility scores [0.0 - 100.0] based on:
 *    - Time window overlap duration
 *    - Riding pace compatibility (Relaxed, Moderate, Brisk)
 *    - Starting location proximity within Bangalore
 *    - Past peer rating feedback ("would ride with again" bonus)
 * 3. Construct compatibility graph: nodes = RideIntents, edges = compatibility score >= THRESHOLD (50.0).
 * 4. Sort edges in descending order of score.
 * 5. Greedy Union-Find Clustering: iterate edges and union two sets if combined size <= MAX_GROUP_SIZE (6).
 * 6. Filter formed clusters that satisfy MIN_GROUP_SIZE (3).
 * 7. Assign rendezvous checkpoint in Bangalore and persist RideGroup + RideGroupMember entities.
 */
@Service
@RequiredArgsConstructor
public class MatchingEngineService {

    private static final Logger logger = LoggerFactory.getLogger(MatchingEngineService.class);

    public static final int MIN_GROUP_SIZE = 3;
    public static final int MAX_GROUP_SIZE = 6;
    public static final double COMPATIBILITY_THRESHOLD = 50.0;

    private final RideIntentRepository rideIntentRepository;
    private final RideGroupRepository rideGroupRepository;
    private final RideGroupMemberRepository rideGroupMemberRepository;
    private final RatingRepository ratingRepository;

    /**
     * Scheduled Job: Runs automatically every Friday at 6:00 PM (18:00) to match weekend rides.
     * Cron expression: "0 0 18 * * FRI"
     */
    @Scheduled(cron = "0 0 18 * * FRI")
    public void runScheduledWeekendMatching() {
        logger.info("Triggering scheduled weekend matching job...");
        LocalDate upcomingSaturday = LocalDate.now().plusDays((6 - LocalDate.now().getDayOfWeek().getValue() + 7) % 7);
        LocalDate upcomingSunday = upcomingSaturday.plusDays(1);

        executeMatching(upcomingSaturday, null);
        executeMatching(upcomingSunday, null);
    }

    /**
     * Manual Trigger for testing, demo, or on-demand matching.
     */
    @Transactional
    public MatchingSummaryDTO executeMatching(LocalDate targetDate, String targetDestination) {
        logger.info("Starting RideTribe Matching Engine. Target Date: {}, Destination: {}", targetDate, targetDestination);

        // 1. Fetch pending intents
        List<RideIntent> pendingIntents;
        if (targetDate != null && targetDestination != null && !targetDestination.isBlank()) {
            pendingIntents = rideIntentRepository.findByDestinationIgnoreCaseAndTravelModeAndStatusAndRideDate(
                    targetDestination, TravelMode.BIKE, RideIntentStatus.PENDING, targetDate);
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

        // 2. Partition by (Destination Lowercase + Date + TravelMode)
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

            // Match this candidate pool using Union-Find
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

    /**
     * Matches a single homogenous candidate pool (same destination, date, mode).
     */
    private List<MatchingClusterDTO> matchPool(List<RideIntent> intents) {
        int n = intents.size();
        DisjointSetUnion uf = new DisjointSetUnion(n, MAX_GROUP_SIZE);

        // 1. Build list of compatibility edges between all pairs
        List<CompatibilityEdge> edges = new ArrayList<>();

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                RideIntent a = intents.get(i);
                RideIntent b = intents.get(j);

                // Skip if same user posted multiple intents
                if (a.getUser().getId().equals(b.getUser().getId())) {
                    continue;
                }

                double score = computePairwiseCompatibility(a, b);
                if (score >= COMPATIBILITY_THRESHOLD) {
                    edges.add(new CompatibilityEdge(i, j, score));
                }
            }
        }

        // 2. Sort edges by descending compatibility score (Greedy choice)
        edges.sort((e1, e2) -> Double.compare(e2.score, e1.score));

        // 3. Greedily merge clusters using Disjoint Set Union
        for (CompatibilityEdge edge : edges) {
            uf.union(edge.u, edge.v);
        }

        // 4. Extract clusters from Union-Find
        Map<Integer, List<Integer>> rootToMembers = uf.getClusters();

        List<MatchingClusterDTO> resultClusters = new ArrayList<>();

        for (Map.Entry<Integer, List<Integer>> entry : rootToMembers.entrySet()) {
            List<Integer> memberIndices = entry.getValue();

            // Only form group if cluster satisfies MIN_GROUP_SIZE (3)
            if (memberIndices.size() >= MIN_GROUP_SIZE) {
                List<RideIntent> matchedIntents = memberIndices.stream()
                        .map(intents::get)
                        .collect(Collectors.toList());

                // Persist formed group and transition intents
                RideGroup formedGroup = persistRideGroup(matchedIntents);

                // Compute average compatibility score in this cluster
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

    /**
     * Pairwise Compatibility Scoring Function:
     * Calculates compatibility score in range [0, 100].
     */
    public double computePairwiseCompatibility(RideIntent a, RideIntent b) {
        // 1. Time Window Overlap Score (Weight: 50%)
        double timeScore = computeTimeWindowOverlapScore(a, b);
        if (timeScore <= 0.0) {
            return 0.0; // Incompatible if no time overlap
        }

        // 2. Riding Pace Match (Weight: 25%)
        double paceScore = 0.0;
        if (a.getPace() != null && b.getPace() != null) {
            if (a.getPace() == b.getPace()) {
                paceScore = 25.0;
            } else if (Math.abs(a.getPace().ordinal() - b.getPace().ordinal()) == 1) {
                paceScore = 15.0; // Adjacent pace (e.g. Relaxed & Moderate)
            } else {
                paceScore = 5.0;  // Opposite extremes (Relaxed vs Brisk)
            }
        } else {
            paceScore = 20.0;
        }

        // 3. Bangalore Starting Location Match (Weight: 15%)
        double locationScore = 10.0; // default base score
        if (a.getStartingArea() != null && b.getStartingArea() != null) {
            if (a.getStartingArea().trim().equalsIgnoreCase(b.getStartingArea().trim())) {
                locationScore = 15.0;
            } else if (isNearbyBangaloreArea(a.getStartingArea(), b.getStartingArea())) {
                locationScore = 12.0;
            }
        }

        // 4. Past "Would Ride Again" Positive History Bonus (Weight: 10%)
        double historyBonus = 0.0;
        try {
            boolean aLikesB = ratingRepository.hasPositiveHistory(a.getUser().getId(), b.getUser().getId());
            boolean bLikesA = ratingRepository.hasPositiveHistory(b.getUser().getId(), a.getUser().getId());
            if (aLikesB && bLikesA) {
                historyBonus = 10.0;
            } else if (aLikesB || bLikesA) {
                historyBonus = 5.0;
            }
        } catch (Exception ignored) {
            // Safe fallback if database query fails or in unit tests
        }

        return timeScore * 0.50 + paceScore + locationScore + historyBonus;
    }

    /**
     * Calculates time window overlap score between two intents.
     * Returns score between 0.0 and 100.0.
     */
    public double computeTimeWindowOverlapScore(RideIntent a, RideIntent b) {
        LocalTime startA = a.getWindowStartTime();
        LocalTime endA = a.getWindowEndTime();
        LocalTime startB = b.getWindowStartTime();
        LocalTime endB = b.getWindowEndTime();

        // Calculate overlap interval: [max(startA, startB), min(endA, endB)]
        LocalTime overlapStart = startA.isAfter(startB) ? startA : startB;
        LocalTime overlapEnd = endA.isBefore(endB) ? endA : endB;

        if (!overlapStart.isBefore(overlapEnd)) {
            return 0.0; // No overlap
        }

        long overlapMinutes = Duration.between(overlapStart, overlapEnd).toMinutes();
        long durationA = Duration.between(startA, endA).toMinutes();
        long durationB = Duration.between(startB, endB).toMinutes();
        long minDuration = Math.min(durationA, durationB);

        if (minDuration <= 0) return 0.0;

        // Ratio of overlap to the shorter window
        double overlapRatio = (double) overlapMinutes / minDuration;
        return Math.min(100.0, overlapRatio * 100.0);
    }

    private boolean isNearbyBangaloreArea(String area1, String area2) {
        String a1 = area1.toLowerCase();
        String a2 = area2.toLowerCase();
        // Simple heuristic proximity clusters in Bangalore
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

    /**
     * Creates and persists a RideGroup along with its RideGroupMember records,
     * and updates the matched RideIntents.
     */
    @Transactional
    public RideGroup persistRideGroup(List<RideIntent> matchedIntents) {
        RideIntent first = matchedIntents.get(0);
        String destination = first.getDestination();
        TravelMode travelMode = first.getTravelMode();
        LocalDate rideDate = first.getRideDate();

        // Calculate optimal rendezvous time: midpoint of the common overlapping start times
        LocalTime maxStart = matchedIntents.stream()
                .map(RideIntent::getWindowStartTime)
                .max(LocalTime::compareTo)
                .orElse(LocalTime.of(6, 0));

        // Get Bangalore checkpoint and destination coordinates
        BangaloreRouteInfo routeInfo = resolveRouteInfo(destination);

        RideGroup group = RideGroup.builder()
                .destination(destination)
                .travelMode(travelMode)
                .rideDate(rideDate)
                .scheduledTime(maxStart)
                .meetingPointName(routeInfo.meetingPointName)
                .meetingPointLat(routeInfo.meetingPointLat)
                .meetingPointLng(routeInfo.meetingPointLng)
                .destinationLat(routeInfo.destinationLat)
                .destinationLng(routeInfo.destinationLng)
                .estimatedDistanceKm(routeInfo.estimatedDistanceKm)
                .status(RideGroupStatus.CONFIRMED)
                .build();

        RideGroup savedGroup = rideGroupRepository.save(group);

        // Create members
        boolean isFirst = true;
        for (RideIntent intent : matchedIntents) {
            RideGroupMember member = RideGroupMember.builder()
                    .rideGroup(savedGroup)
                    .user(intent.getUser())
                    .isLead(isFirst) // first matched rider is assigned initial lead
                    .onMyWay(false)
                    .currentLat(routeInfo.meetingPointLat)
                    .currentLng(routeInfo.meetingPointLng)
                    .build();
            rideGroupMemberRepository.save(member);
            savedGroup.getMembers().add(member);

            // Update RideIntent status
            intent.setStatus(RideIntentStatus.MATCHED);
            intent.setMatchedGroupId(savedGroup.getId());
            rideIntentRepository.save(intent);

            isFirst = false;
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

    // --- Helper Classes ---

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

    /**
     * Disjoint Set Union (Union-Find) with group size tracking and size cap constraints.
     */
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
            return parent[i] = find(parent[i]); // Path compression
        }

        public boolean union(int i, int j) {
            int rootI = find(i);
            int rootJ = find(j);

            if (rootI == rootJ) {
                return false; // Already in the same group
            }

            // Check max group size limit (3 to 6 members)
            if (size[rootI] + size[rootJ] > maxSize) {
                return false; // Would exceed max group size
            }

            // Merge smaller tree into larger tree
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
