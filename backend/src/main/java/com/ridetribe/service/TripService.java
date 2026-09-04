package com.ridetribe.service;

import com.ridetribe.dto.*;
import com.ridetribe.model.*;
import com.ridetribe.repository.RideGroupRepository;
import com.ridetribe.repository.SosEventRepository;
import com.ridetribe.repository.TripChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {

    private static final Logger logger = LoggerFactory.getLogger(TripService.class);

    private final RideGroupRepository rideGroupRepository;
    private final TripChatMessageRepository tripChatMessageRepository;
    private final SosEventRepository sosEventRepository;
    private final AuthService authService;
    private final SimpMessagingTemplate messagingTemplate;

    public TripDTO createTrip(CreateTripRequest request) {
        User host = authService.getCurrentAuthenticatedUser();

        int max = request.getMaxMembers() != null && request.getMaxMembers() > 0 ? request.getMaxMembers() : 5;
        int days = request.getNumberOfDays() != null && request.getNumberOfDays() > 0 ? request.getNumberOfDays() : 1;

        // Host is automatically added as first lead member
        RideGroupMember hostMember = RideGroupMember.builder()
                .id(new ObjectId().toHexString())
                .user(host)
                .isLead(true)
                .onMyWay(false)
                .joinedAt(LocalDateTime.now())
                .build();

        List<RideGroupMember> initialMembers = new ArrayList<>();
        initialMembers.add(hostMember);

        RideGroup trip = RideGroup.builder()
                .title(request.getTitle() != null ? request.getTitle() : (request.getDestination() + " Group Ride"))
                .description(request.getDescription())
                .hostUser(host)
                .destination(request.getDestination())
                .travelMode(request.getTravelMode())
                .rideDate(request.getRideDate())
                .scheduledTime(request.getScheduledTime())
                .numberOfDays(days)
                .maxMembers(max)
                .whatToCarry(request.getWhatToCarry() != null ? request.getWhatToCarry() : "Full-face helmet, Rain gear, Toolkit, Hydration pack")
                .coverImageUrl(request.getCoverImageUrl())
                .meetingPointName(request.getMeetingPointName() != null ? request.getMeetingPointName() : "Esteem Mall, Hebbal Flyover (Airport Rd)")
                .meetingPointLat(request.getMeetingPointLat() != null ? request.getMeetingPointLat() : 13.0428)
                .meetingPointLng(request.getMeetingPointLng() != null ? request.getMeetingPointLng() : 77.5912)
                .destinationLat(request.getDestinationLat() != null ? request.getDestinationLat() : 13.3702)
                .destinationLng(request.getDestinationLng() != null ? request.getDestinationLng() : 77.6835)
                .estimatedDistanceKm(request.getEstimatedDistanceKm() != null ? request.getEstimatedDistanceKm() : 60.0)
                .status(RideGroupStatus.FORMING)
                .members(initialMembers)
                .requests(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();

        RideGroup savedTrip = rideGroupRepository.save(trip);
        logger.info("🚗 New Trip created: {} to {} by Host {}", savedTrip.getTitle(), savedTrip.getDestination(), host.getName());

        return TripDTO.fromEntity(savedTrip, host.getId());
    }

    public List<TripDTO> getAllTrips() {
        String currentUserId = null;
        try {
            User user = authService.getCurrentAuthenticatedUser();
            currentUserId = user.getId();
        } catch (Exception ignored) {}

        final String userId = currentUserId;
        return rideGroupRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(trip -> TripDTO.fromEntity(trip, userId))
                .collect(Collectors.toList());
    }

    public TripDTO getTripById(String id) {
        RideGroup trip = rideGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found: " + id));

        String currentUserId = null;
        try {
            User user = authService.getCurrentAuthenticatedUser();
            currentUserId = user.getId();
        } catch (Exception ignored) {}

        return TripDTO.fromEntity(trip, currentUserId);
    }

    public TripJoinRequestDTO sendJoinRequest(String tripId, SendJoinRequestDTO request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RideGroup trip = rideGroupRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));

        if (trip.isFull()) {
            throw new IllegalStateException("Trip is already full! Member limit reached.");
        }

        // Check if user is already an accepted member
        boolean isMember = trip.getMembers() != null && trip.getMembers().stream()
                .anyMatch(m -> m.getUser() != null && currentUser.getId().equals(m.getUser().getId()));
        if (isMember) {
            throw new IllegalStateException("You are already an accepted member of this trip.");
        }

        // Check if join request is already pending
        if (trip.getRequests() == null) {
            trip.setRequests(new ArrayList<>());
        }
        boolean hasPending = trip.getRequests().stream()
                .anyMatch(r -> r.getUser() != null && currentUser.getId().equals(r.getUser().getId()) && r.getStatus() == JoinRequestStatus.PENDING);
        if (hasPending) {
            throw new IllegalStateException("You already have a pending join request for this trip.");
        }

        TripJoinRequest joinReq = TripJoinRequest.builder()
                .id(new ObjectId().toHexString())
                .tripId(tripId)
                .user(currentUser)
                .status(JoinRequestStatus.PENDING)
                .message(request != null ? request.getMessage() : "Looking forward to riding together!")
                .createdAt(LocalDateTime.now())
                .build();

        trip.getRequests().add(joinReq);
        rideGroupRepository.save(trip);
        logger.info("📩 User {} requested to join Trip {}", currentUser.getName(), trip.getTitle());

        return TripJoinRequestDTO.fromEntity(joinReq);
    }

    public List<TripJoinRequestDTO> getTripJoinRequests(String tripId) {
        RideGroup trip = rideGroupRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));

        if (trip.getRequests() == null) {
            return List.of();
        }
        return trip.getRequests().stream()
                .map(TripJoinRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public TripJoinRequestDTO respondToJoinRequest(String tripId, String requestId, RespondJoinRequestDTO response) {
        User host = authService.getCurrentAuthenticatedUser();
        RideGroup trip = rideGroupRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));

        // Ensure current user is the host or lead member
        if (trip.getHostUser() != null && !trip.getHostUser().getId().equals(host.getId())) {
            boolean isLead = trip.getMembers() != null && trip.getMembers().stream()
                    .anyMatch(m -> m.getUser() != null && host.getId().equals(m.getUser().getId()) && Boolean.TRUE.equals(m.getIsLead()));
            if (!isLead) {
                throw new SecurityException("Only the trip host can approve or reject join requests.");
            }
        }

        if (trip.getRequests() == null) {
            throw new RuntimeException("No join requests found for this trip.");
        }

        TripJoinRequest req = trip.getRequests().stream()
                .filter(r -> requestId.equals(r.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Join request not found: " + requestId));

        if (response.getStatus() == JoinRequestStatus.APPROVED) {
            if (trip.isFull()) {
                throw new IllegalStateException("Cannot approve request: Trip capacity limit has been reached.");
            }

            req.setStatus(JoinRequestStatus.APPROVED);
            req.setRespondedAt(LocalDateTime.now());

            if (trip.getMembers() == null) {
                trip.setMembers(new ArrayList<>());
            }

            // Check if already in member list
            boolean alreadyMember = trip.getMembers().stream()
                    .anyMatch(m -> m.getUser() != null && req.getUser() != null && req.getUser().getId().equals(m.getUser().getId()));
            if (!alreadyMember) {
                RideGroupMember newMember = RideGroupMember.builder()
                        .id(new ObjectId().toHexString())
                        .user(req.getUser())
                        .isLead(false)
                        .onMyWay(false)
                        .joinedAt(LocalDateTime.now())
                        .build();
                trip.getMembers().add(newMember);
            }

            // If trip member limit reached, update status to CONFIRMED
            if (trip.getMembers().size() >= trip.getMaxMembers()) {
                trip.setStatus(RideGroupStatus.CONFIRMED);
            }

            rideGroupRepository.save(trip);
            logger.info("✅ Host {} approved user {} for Trip {}", host.getName(), req.getUser().getName(), trip.getTitle());
        } else {
            req.setStatus(JoinRequestStatus.REJECTED);
            req.setRespondedAt(LocalDateTime.now());
            rideGroupRepository.save(trip);
            logger.info("❌ Host {} rejected user {} for Trip {}", host.getName(), req.getUser() != null ? req.getUser().getName() : "User", trip.getTitle());
        }

        return TripJoinRequestDTO.fromEntity(req);
    }

    public List<TripChatMessageDTO> getTripChatMessages(String tripId) {
        return tripChatMessageRepository.findByTripIdOrderBySentAtAsc(tripId).stream()
                .map(TripChatMessageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public TripChatMessageDTO sendTripChatMessage(String tripId, String content) {
        User sender = authService.getCurrentAuthenticatedUser();
        RideGroup trip = rideGroupRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));

        TripChatMessage msg = TripChatMessage.builder()
                .tripId(trip.getId())
                .sender(sender)
                .content(content)
                .sentAt(LocalDateTime.now())
                .build();

        TripChatMessage saved = tripChatMessageRepository.save(msg);
        TripChatMessageDTO dto = TripChatMessageDTO.fromEntity(saved);

        // Broadcast to WebSocket subscribers on /topic/trips/{tripId}/chat
        messagingTemplate.convertAndSend("/topic/trips/" + tripId + "/chat", dto);

        return dto;
    }

    public void deleteTrip(String tripId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RideGroup trip = rideGroupRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));

        // Ensure current user is host or lead member
        if (trip.getHostUser() != null && !trip.getHostUser().getId().equals(currentUser.getId())) {
            boolean isLead = trip.getMembers() != null && trip.getMembers().stream()
                    .anyMatch(m -> m.getUser() != null && currentUser.getId().equals(m.getUser().getId()) && Boolean.TRUE.equals(m.getIsLead()));
            if (!isLead) {
                throw new SecurityException("Only the trip host can delete this trip.");
            }
        }

        // Clean up chat messages and SOS events referencing this trip
        tripChatMessageRepository.deleteByTripId(tripId);
        sosEventRepository.deleteByRideGroupId(tripId);
        rideGroupRepository.delete(trip);

        logger.info("🗑️ Trip '{}' (ID: {}) deleted by user {}", trip.getTitle(), tripId, currentUser.getName());
    }
}
