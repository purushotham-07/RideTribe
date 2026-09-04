package com.ridetribe;

import com.ridetribe.dto.MatchingSummaryDTO;
import com.ridetribe.model.*;
import com.ridetribe.repository.RatingRepository;
import com.ridetribe.repository.RideGroupRepository;
import com.ridetribe.repository.RideIntentRepository;
import com.ridetribe.service.MatchingEngineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatchingEngineServiceTest {

    @Mock
    private RideIntentRepository rideIntentRepository;

    @Mock
    private RideGroupRepository rideGroupRepository;

    @Mock
    private RatingRepository ratingRepository;

    @InjectMocks
    private MatchingEngineService matchingEngineService;

    private LocalDate testDate;

    @BeforeEach
    void setUp() {
        testDate = LocalDate.of(2026, 8, 22);
    }

    @Test
    @DisplayName("DisjointSetUnion should correctly merge within max group size limit of 6")
    void testDisjointSetUnionSizeConstraint() {
        int n = 10;
        int maxGroupSize = 6;
        MatchingEngineService.DisjointSetUnion uf = new MatchingEngineService.DisjointSetUnion(n, maxGroupSize);

        // Merge elements 0, 1, 2, 3, 4 into group of 5
        assertTrue(uf.union(0, 1));
        assertTrue(uf.union(1, 2));
        assertTrue(uf.union(2, 3));
        assertTrue(uf.union(3, 4));
        assertEquals(5, uf.getSize(0));

        // Adding 5 should succeed (group size becomes 6)
        assertTrue(uf.union(4, 5));
        assertEquals(6, uf.getSize(0));

        // Adding 6 should fail because max size is 6
        assertFalse(uf.union(5, 6));
        assertEquals(6, uf.getSize(0));
    }

    @Test
    @DisplayName("Time Window Overlap calculation should return 100 for identical windows")
    void testIdenticalTimeWindowOverlap() {
        RideIntent a = RideIntent.builder()
                .windowStartTime(LocalTime.of(6, 0))
                .windowEndTime(LocalTime.of(7, 0))
                .build();

        RideIntent b = RideIntent.builder()
                .windowStartTime(LocalTime.of(6, 0))
                .windowEndTime(LocalTime.of(7, 0))
                .build();

        double score = matchingEngineService.computeTimeWindowOverlapScore(a, b);
        assertEquals(100.0, score, 0.001);
    }

    @Test
    @DisplayName("Time Window Overlap calculation should return 0 for disjoint windows")
    void testDisjointTimeWindowOverlap() {
        RideIntent a = RideIntent.builder()
                .windowStartTime(LocalTime.of(6, 0))
                .windowEndTime(LocalTime.of(7, 0))
                .build();

        RideIntent b = RideIntent.builder()
                .windowStartTime(LocalTime.of(7, 30))
                .windowEndTime(LocalTime.of(8, 30))
                .build();

        double score = matchingEngineService.computeTimeWindowOverlapScore(a, b);
        assertEquals(0.0, score, 0.001);
    }

    @Test
    @DisplayName("Pairwise compatibility should score high for same pace, overlapping time, and nearby area")
    void testPairwiseCompatibilityHighScore() {
        User user1 = User.builder().id("user-1").name("Rider 1").build();
        User user2 = User.builder().id("user-2").name("Rider 2").build();

        RideIntent a = RideIntent.builder()
                .user(user1)
                .destination("Nandi Hills")
                .travelMode(TravelMode.BIKE)
                .pace(Pace.MODERATE)
                .startingArea("Hebbal")
                .windowStartTime(LocalTime.of(6, 0))
                .windowEndTime(LocalTime.of(7, 0))
                .build();

        RideIntent b = RideIntent.builder()
                .user(user2)
                .destination("Nandi Hills")
                .travelMode(TravelMode.BIKE)
                .pace(Pace.MODERATE)
                .startingArea("Hebbal")
                .windowStartTime(LocalTime.of(6, 15))
                .windowEndTime(LocalTime.of(7, 0))
                .build();

        double score = matchingEngineService.computePairwiseCompatibility(a, b);
        assertTrue(score >= 70.0, "Score should be >= 70.0, was: " + score);
    }

    @Test
    @DisplayName("Greedy Graph Matcher should form a group of 4 riders when 4 compatible intents exist")
    void testSuccessfulMatchingOfFourRiders() {
        List<RideIntent> intents = new ArrayList<>();
        for (int i = 1; i <= 4; i++) {
            User user = User.builder().id("user-" + i).name("Rider " + i).email("rider" + i + "@test.com").build();
            intents.add(RideIntent.builder()
                    .id("intent-" + i)
                    .user(user)
                    .destination("Nandi Hills")
                    .travelMode(TravelMode.BIKE)
                    .pace(Pace.MODERATE)
                    .rideDate(testDate)
                    .startingArea("Hebbal")
                    .windowStartTime(LocalTime.of(6, 0))
                    .windowEndTime(LocalTime.of(7, 0))
                    .status(RideIntentStatus.PENDING)
                    .build());
        }

        when(rideIntentRepository.findByStatus(RideIntentStatus.PENDING)).thenReturn(intents);
        when(rideGroupRepository.save(any(RideGroup.class))).thenAnswer(invocation -> {
            RideGroup group = invocation.getArgument(0);
            group.setId("group-100");
            return group;
        });

        MatchingSummaryDTO summary = matchingEngineService.executeMatching(null, null);

        assertNotNull(summary);
        assertEquals(4, summary.getTotalIntentsProcessed());
        assertEquals(4, summary.getTotalUsersMatched());
        assertEquals(1, summary.getTotalGroupsFormed());
        assertEquals(0, summary.getUnmergedPendingIntents());
        assertEquals(1, summary.getFormedGroups().size());
        assertEquals(4, summary.getFormedGroups().get(0).getMatchedUsers().size());
    }

    @Test
    @DisplayName("Greedy Graph Matcher should NOT form a group if fewer than 3 riders exist in pool")
    void testUnderMinimumSizeNotMatched() {
        List<RideIntent> intents = Arrays.asList(
                RideIntent.builder()
                        .id("intent-1")
                        .user(User.builder().id("user-1").name("Rider 1").build())
                        .destination("Nandi Hills")
                        .travelMode(TravelMode.BIKE)
                        .pace(Pace.MODERATE)
                        .rideDate(testDate)
                        .windowStartTime(LocalTime.of(6, 0))
                        .windowEndTime(LocalTime.of(7, 0))
                        .status(RideIntentStatus.PENDING)
                        .build(),
                RideIntent.builder()
                        .id("intent-2")
                        .user(User.builder().id("user-2").name("Rider 2").build())
                        .destination("Nandi Hills")
                        .travelMode(TravelMode.BIKE)
                        .pace(Pace.MODERATE)
                        .rideDate(testDate)
                        .windowStartTime(LocalTime.of(6, 0))
                        .windowEndTime(LocalTime.of(7, 0))
                        .status(RideIntentStatus.PENDING)
                        .build()
        );

        when(rideIntentRepository.findByStatus(RideIntentStatus.PENDING)).thenReturn(intents);

        MatchingSummaryDTO summary = matchingEngineService.executeMatching(null, null);

        assertNotNull(summary);
        assertEquals(2, summary.getTotalIntentsProcessed());
        assertEquals(0, summary.getTotalUsersMatched());
        assertEquals(0, summary.getTotalGroupsFormed());
        assertEquals(2, summary.getUnmergedPendingIntents());
        assertTrue(summary.getFormedGroups().isEmpty());
    }
}
