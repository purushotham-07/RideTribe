package com.ridetribe;

import com.ridetribe.dto.*;
import com.ridetribe.model.*;
import com.ridetribe.repository.*;
import com.ridetribe.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FullBackendIntegrationTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RideGroupRepository rideGroupRepository;

    @Mock
    private TripChatMessageRepository tripChatMessageRepository;

    @Mock
    private SosEventRepository sosEventRepository;

    @Mock
    private RideIntentRepository rideIntentRepository;

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private AuthService authService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private TripService tripService;

    @InjectMocks
    private RideIntentService rideIntentService;

    @InjectMocks
    private RatingService ratingService;

    @InjectMocks
    private SosService sosService;

    private User testHost;
    private User testApplicant;

    @BeforeEach
    void setUp() {
        testHost = User.builder()
                .id("host-123")
                .name("Rahul Sharma")
                .email("rahul@ridetribe.in")
                .vehicleModel("Himalayan 450")
                .build();

        testApplicant = User.builder()
                .id("applicant-456")
                .name("Sneha Patel")
                .email("sneha@ridetribe.in")
                .vehicleModel("BMW G310GS")
                .build();
    }

    @Test
    void testTripCreationAndJoinRequestFlow() {
        when(authService.getCurrentAuthenticatedUser()).thenReturn(testHost);

        CreateTripRequest createReq = CreateTripRequest.builder()
                .title("Sunrise Coffee Run to Nandi")
                .description("Catch the 6 AM sunrise")
                .destination("Nandi Hills")
                .travelMode(TravelMode.BIKE)
                .rideDate(LocalDate.now().plusDays(3))
                .scheduledTime(LocalTime.of(5, 30))
                .numberOfDays(1)
                .maxMembers(2)
                .whatToCarry("Full-face helmet, Rain jacket, Toolkit")
                .meetingPointName("Esteem Mall, Hebbal")
                .meetingPointLat(13.0428)
                .meetingPointLng(77.5912)
                .build();

        when(rideGroupRepository.save(any(RideGroup.class))).thenAnswer(inv -> {
            RideGroup g = inv.getArgument(0);
            g.setId("trip-789");
            return g;
        });

        TripDTO hostedTrip = tripService.createTrip(createReq);
        assertNotNull(hostedTrip.getId());
        assertEquals("trip-789", hostedTrip.getId());
        assertEquals(1, hostedTrip.getCurrentMembersCount());
        assertFalse(hostedTrip.getIsFull());

        // 2. Applicant sends join request
        when(authService.getCurrentAuthenticatedUser()).thenReturn(testApplicant);
        RideGroup tripWithHost = RideGroup.builder()
                .id("trip-789")
                .title("Sunrise Coffee Run to Nandi")
                .hostUser(testHost)
                .maxMembers(2)
                .members(new ArrayList<>(List.of(RideGroupMember.builder().id("m-1").user(testHost).isLead(true).build())))
                .requests(new ArrayList<>())
                .build();

        when(rideGroupRepository.findById("trip-789")).thenReturn(Optional.of(tripWithHost));

        SendJoinRequestDTO sendReq = SendJoinRequestDTO.builder().message("Can I join?").build();
        TripJoinRequestDTO reqDTO = tripService.sendJoinRequest("trip-789", sendReq);

        assertNotNull(reqDTO.getId());
        assertEquals(JoinRequestStatus.PENDING, reqDTO.getStatus());
        assertEquals(1, tripWithHost.getRequests().size());

        // 3. Host approves join request
        when(authService.getCurrentAuthenticatedUser()).thenReturn(testHost);
        RespondJoinRequestDTO approveReq = RespondJoinRequestDTO.builder().status(JoinRequestStatus.APPROVED).build();
        TripJoinRequestDTO approved = tripService.respondToJoinRequest("trip-789", reqDTO.getId(), approveReq);

        assertEquals(JoinRequestStatus.APPROVED, approved.getStatus());
        assertEquals(2, tripWithHost.getMembers().size());
        assertEquals(RideGroupStatus.CONFIRMED, tripWithHost.getStatus());
    }

    @Test
    void testCreateIntent() {
        when(authService.getCurrentAuthenticatedUser()).thenReturn(testHost);
        when(rideIntentRepository.save(any(RideIntent.class))).thenAnswer(inv -> {
            RideIntent intent = inv.getArgument(0);
            intent.setId("intent-111");
            return intent;
        });

        CreateRideIntentRequest req = CreateRideIntentRequest.builder()
                .destination("Nandi Hills")
                .travelMode(TravelMode.BIKE)
                .pace(Pace.MODERATE)
                .rideDate(LocalDate.now().plusDays(2))
                .windowStartTime(LocalTime.of(5, 30))
                .windowEndTime(LocalTime.of(7, 30))
                .startingArea("Hebbal")
                .notes("Early morning sunrise run")
                .build();

        RideIntentDTO intentDTO = rideIntentService.createIntent(req);
        assertNotNull(intentDTO.getId());
        assertEquals("Nandi Hills", intentDTO.getDestination());
        assertEquals(RideIntentStatus.PENDING, intentDTO.getStatus());
    }

    @Test
    void testSosTrigger() {
        when(authService.getCurrentAuthenticatedUser()).thenReturn(testHost);
        RideGroup group = RideGroup.builder().id("trip-789").title("Test Group").build();
        when(rideGroupRepository.findById("trip-789")).thenReturn(Optional.of(group));
        when(sosEventRepository.save(any(SosEvent.class))).thenAnswer(inv -> {
            SosEvent e = inv.getArgument(0);
            e.setId("sos-999");
            return e;
        });

        SosTriggerRequest sosReq = SosTriggerRequest.builder()
                .rideGroupId("trip-789")
                .lat(13.0428)
                .lng(77.5912)
                .notes("Flat tire near toll gate")
                .build();

        SosAlertDTO alert = sosService.triggerSos(sosReq);
        assertNotNull(alert.getSosEventId());
        assertEquals("trip-789", alert.getRideGroupId());
        assertEquals("host-123", alert.getUserId());
    }

    @Test
    void testSubmitRating() {
        when(authService.getCurrentAuthenticatedUser()).thenReturn(testHost);
        RideGroup group = RideGroup.builder().id("trip-789").title("Test Group").build();
        when(rideGroupRepository.findById("trip-789")).thenReturn(Optional.of(group));
        when(userRepository.findById("applicant-456")).thenReturn(Optional.of(testApplicant));
        when(ratingRepository.findByRideGroupIdAndRaterIdAndRateeId("trip-789", "host-123", "applicant-456"))
                .thenReturn(Optional.empty());
        when(ratingRepository.save(any(Rating.class))).thenAnswer(inv -> {
            Rating r = inv.getArgument(0);
            r.setId("rating-555");
            return r;
        });

        SubmitRatingRequest req = SubmitRatingRequest.builder()
                .rideGroupId("trip-789")
                .rateeId("applicant-456")
                .score(5.0)
                .comment("Great riding partner!")
                .build();

        RatingDTO ratingDTO = ratingService.submitRating(req);
        assertNotNull(ratingDTO.getId());
        assertEquals(5.0, ratingDTO.getScore());
        assertEquals("Great riding partner!", ratingDTO.getComment());
    }
}
