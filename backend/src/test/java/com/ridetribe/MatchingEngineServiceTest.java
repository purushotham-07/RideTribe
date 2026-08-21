package com.ridetribe;

import com.ridetribe.dto.MatchingSummaryDTO;
import com.ridetribe.model.*;
import com.ridetribe.repository.RatingRepository;
import com.ridetribe.repository.RideGroupMemberRepository;
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
    private RideGroupMemberRepository rideGroupMemberRepository;

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

        // Form another group of 2: {5, 6}
        assertTrue(uf.union(5, 6));
        assertEquals(2, uf.getSize(5));

        // Trying to union group {0,1,2,3,4} (size 5) and {5,6} (size 2) would make size 7 > 6
        // Must return false and NOT merge!
        assertFalse(uf.union(0, 5));
        assertEquals(5, uf.getSize(0));
        assertEquals(2, uf.getSize(5));

        // But unioning element 7 (size 1) into {0,1,2,3,4} makes size 6 <= 6, which is allowed
        assertTrue(uf.union(0, 7));
        assertEquals(6, uf.getSize(0));

        // Now group 0 is maxed out at 6. Cannot add any more
        assertFalse(uf.union(0, 8));
    }

    @Test
    @DisplayName("Time window overlap score should correctly handle identical, partial, and non-overlapping windows")
    void testTimeWindowOverlapScoring() {
        User u1 = User.builder().id(1L).name("Rider 1").build();
        User u2 = User.builder().id(2L).name("Rider 2").build();

        // 1. Identical windows (06:00 to 08:00)
        RideIntent i1 = RideIntent.builder()
                .user(u1)
                .windowStartTime(LocalTime.of(6, 0))
                .windowEndTime(LocalTime.of(8, 0))
                .build();
        RideIntent i2 = RideIntent.builder()
                .user(u2)
                .windowStartTime(LocalTime.of(6, 0))
                .windowEndTime(LocalTime.of(8, 0))
                .build();

        double scoreIdentical = matchingEngineService.computeTimeWindowOverlapScore(i1, i2);
        assertEquals(100.0, scoreIdentical, 0.01);

        // 2. Partial overlap: 06:00-08:00 and 07:00-09:00 (1 hour overlap out of 2 hours = 50%)
        RideIntent i3 = RideIntent.builder()
                .user(u2)
                .windowStartTime(LocalTime.of(7, 0))
                .windowEndTime(LocalTime.of(9, 0))
                .build();

        double scorePartial = matchingEngineService.computeTimeWindowOverlapScore(i1, i3);
        assertEquals(50.0, scorePartial, 0.01);

        // 3. Disjoint windows: 06:00-07:00 and 08:00-09:00 (0% overlap)
        RideIntent i4 = RideIntent.builder()
                .user(u2)
                .windowStartTime(LocalTime.of(8, 0))
                .windowEndTime(LocalTime.of(9, 0))
                .build();

        double scoreDisjoint = matchingEngineService.computeTimeWindowOverlapScore(i1, i4);
        assertEquals(0.0, scoreDisjoint, 0.01);
    }

    @Test
    @DisplayName("Pairwise compatibility should include pace, location, and overlap")
    void testPairwiseCompatibility() {
        User u1 = User.builder().id(1L).name("Rider A").build();
        User u2 = User.builder().id(2L).name("Rider B").build();

        RideIntent i1 = RideIntent.builder()
                .user(u1)
                .destination("Nandi Hills")
                .travelMode(TravelMode.BIKE)
                .pace(Pace.MODERATE)
                .startingArea("Indiranagar")
                .windowStartTime(LocalTime.of(5, 30))
                .windowEndTime(LocalTime.of(7, 30))
                .build();

        RideIntent i2 = RideIntent.builder()
                .user(u2)
                .destination("Nandi Hills")
                .travelMode(TravelMode.BIKE)
                .pace(Pace.MODERATE)
                .startingArea("Koramangala")
                .windowStartTime(LocalTime.of(5, 30))
                .windowEndTime(LocalTime.of(7, 30))
                .build();

        double compatibility = matchingEngineService.computePairwiseCompatibility(i1, i2);

        // Time overlap: 100 * 0.5 = 50
        // Same Pace: 25
        // Nearby Bangalore area (East Bangalore): 12
        // Total expected >= 85
        assertTrue(compatibility >= 80.0, "Expected compatibility >= 80, got: " + compatibility);
    }

    @Test
    @DisplayName("Matching engine should successfully cluster 4 solo riders into 1 RideGroup of 4")
    void testExecuteMatchingClusters4Riders() {
        List<User> users = new ArrayList<>();
        List<RideIntent> intents = new ArrayList<>();

        for (int i = 1; i <= 4; i++) {
            User u = User.builder()
                    .id((long) i)
                    .name("Bangalore Rider " + i)
                    .email("rider" + i + "@example.com")
                    .preferredMode(TravelMode.BIKE)
                    .avgRating(4.8)
                    .build();
            users.add(u);

            RideIntent intent = RideIntent.builder()
                    .id((long) (100 + i))
                    .user(u)
                    .destination("Nandi Hills")
                    .travelMode(TravelMode.BIKE)
                    .pace(Pace.MODERATE)
                    .rideDate(testDate)
                    .windowStartTime(LocalTime.of(5, 30))
                    .windowEndTime(LocalTime.of(7, 0))
                    .startingArea("Hebbal")
                    .status(RideIntentStatus.PENDING)
                    .build();
            intents.add(intent);
        }

        when(rideIntentRepository.findByStatus(RideIntentStatus.PENDING)).thenReturn(intents);
        when(rideGroupRepository.save(any(RideGroup.class))).thenAnswer(invocation -> {
            RideGroup g = invocation.getArgument(0);
            g.setId(10L);
            return g;
        });

        MatchingSummaryDTO result = matchingEngineService.executeMatching(null, null);

        assertNotNull(result);
        assertEquals(4, result.getTotalIntentsProcessed());
        assertEquals(4, result.getTotalUsersMatched());
        assertEquals(1, result.getTotalGroupsFormed());
        assertEquals(0, result.getUnmergedPendingIntents());
        assertEquals(1, result.getFormedGroups().size());
        assertEquals(4, result.getFormedGroups().get(0).getMatchedUsers().size());
        assertEquals("Nandi Hills", result.getFormedGroups().get(0).getDestination());
        assertTrue(result.getFormedGroups().get(0).getMeetingPointName().contains("Hebbal"));
    }

    @Test
    @DisplayName("Matching engine should isolate different travel modes (Bike vs Car)")
    void testExecuteMatchingSeparatesModes() {
        List<RideIntent> intents = new ArrayList<>();

        // 2 Bike riders (not enough for min size 3)
        for (int i = 1; i <= 2; i++) {
            User u = User.builder().id((long) i).name("Biker " + i).build();
            intents.add(RideIntent.builder()
                    .id((long) i)
                    .user(u)
                    .destination("Coorg")
                    .travelMode(TravelMode.BIKE)
                    .rideDate(testDate)
                    .windowStartTime(LocalTime.of(5, 0))
                    .windowEndTime(LocalTime.of(7, 0))
                    .status(RideIntentStatus.PENDING)
                    .build());
        }

        // 3 Car drivers (meets min size 3)
        for (int i = 3; i <= 5; i++) {
            User u = User.builder().id((long) i).name("Driver " + i).build();
            intents.add(RideIntent.builder()
                    .id((long) i)
                    .user(u)
                    .destination("Coorg")
                    .travelMode(TravelMode.CAR)
                    .rideDate(testDate)
                    .windowStartTime(LocalTime.of(5, 0))
                    .windowEndTime(LocalTime.of(7, 0))
                    .status(RideIntentStatus.PENDING)
                    .build());
        }

        when(rideIntentRepository.findByStatus(RideIntentStatus.PENDING)).thenReturn(intents);
        when(rideGroupRepository.save(any(RideGroup.class))).thenAnswer(invocation -> {
            RideGroup g = invocation.getArgument(0);
            g.setId(20L);
            return g;
        });

        MatchingSummaryDTO result = matchingEngineService.executeMatching(null, null);

        assertNotNull(result);
        assertEquals(5, result.getTotalIntentsProcessed());
        assertEquals(3, result.getTotalUsersMatched()); // only the 3 car drivers matched
        assertEquals(1, result.getTotalGroupsFormed());
        assertEquals(2, result.getUnmergedPendingIntents()); // 2 bikers remained pending
        assertEquals(TravelMode.CAR, result.getFormedGroups().get(0).getTravelMode());
    }
}
