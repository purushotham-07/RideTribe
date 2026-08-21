package com.ridetribe.service;

import com.ridetribe.dto.CreateRideIntentRequest;
import com.ridetribe.dto.RideIntentDTO;
import com.ridetribe.model.Pace;
import com.ridetribe.model.RideIntent;
import com.ridetribe.model.RideIntentStatus;
import com.ridetribe.model.User;
import com.ridetribe.repository.RideIntentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RideIntentService {

    private final RideIntentRepository rideIntentRepository;
    private final AuthService authService;

    @Transactional
    public RideIntentDTO createIntent(CreateRideIntentRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        // Validate time window
        if (request.getWindowEndTime().isBefore(request.getWindowStartTime())) {
            throw new IllegalArgumentException("Window end time must be after start time");
        }

        RideIntent intent = RideIntent.builder()
                .user(currentUser)
                .destination(request.getDestination().trim())
                .travelMode(request.getTravelMode())
                .pace(request.getPace() != null ? request.getPace() : Pace.MODERATE)
                .rideDate(request.getRideDate())
                .windowStartTime(request.getWindowStartTime())
                .windowEndTime(request.getWindowEndTime())
                .startingArea(request.getStartingArea())
                .notes(request.getNotes())
                .status(RideIntentStatus.PENDING)
                .build();

        RideIntent saved = rideIntentRepository.save(intent);
        return RideIntentDTO.fromEntity(saved);
    }

    public List<RideIntentDTO> getMyIntents() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return rideIntentRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(RideIntentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<RideIntentDTO> getAllPendingIntents() {
        return rideIntentRepository.findByStatus(RideIntentStatus.PENDING)
                .stream()
                .map(RideIntentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public RideIntentDTO cancelIntent(Long intentId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RideIntent intent = rideIntentRepository.findById(intentId)
                .orElseThrow(() -> new RuntimeException("Ride intent not found: " + intentId));

        if (!intent.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: Cannot cancel another user's intent");
        }

        intent.setStatus(RideIntentStatus.CANCELLED);
        return RideIntentDTO.fromEntity(rideIntentRepository.save(intent));
    }
}
