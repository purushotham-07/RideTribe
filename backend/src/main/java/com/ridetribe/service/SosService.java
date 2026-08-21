package com.ridetribe.service;

import com.ridetribe.dto.SosAlertDTO;
import com.ridetribe.dto.SosTriggerRequest;
import com.ridetribe.model.RideGroup;
import com.ridetribe.model.SosEvent;
import com.ridetribe.model.SosStatus;
import com.ridetribe.model.User;
import com.ridetribe.repository.RideGroupRepository;
import com.ridetribe.repository.SosEventRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SosService {

    private static final Logger logger = LoggerFactory.getLogger(SosService.class);

    private final SosEventRepository sosEventRepository;
    private final RideGroupRepository rideGroupRepository;
    private final AuthService authService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public SosAlertDTO triggerSos(SosTriggerRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RideGroup group = rideGroupRepository.findById(request.getRideGroupId())
                .orElseThrow(() -> new RuntimeException("Ride group not found: " + request.getRideGroupId()));

        logger.warn("🚨 SOS TRIGGERED by user {} ({}) in ride group {}!",
                currentUser.getName(), currentUser.getEmail(), group.getId());

        SosEvent event = SosEvent.builder()
                .user(currentUser)
                .rideGroup(group)
                .lat(request.getLat())
                .lng(request.getLng())
                .emergencyContactName(currentUser.getEmergencyContactName() != null ? currentUser.getEmergencyContactName() : "Next of Kin")
                .emergencyContactPhone(currentUser.getEmergencyContactPhone() != null ? currentUser.getEmergencyContactPhone() : "+91-9988776655")
                .notes(request.getNotes())
                .status(SosStatus.ACTIVE)
                .triggeredAt(LocalDateTime.now())
                .build();

        SosEvent saved = sosEventRepository.save(event);

        SosAlertDTO alert = SosAlertDTO.builder()
                .sosEventId(saved.getId())
                .rideGroupId(group.getId())
                .userId(currentUser.getId())
                .userName(currentUser.getName())
                .userAvatar(currentUser.getAvatarUrl())
                .vehicleModel(currentUser.getVehicleModel())
                .lat(request.getLat())
                .lng(request.getLng())
                .emergencyContactName(saved.getEmergencyContactName())
                .emergencyContactPhone(saved.getEmergencyContactPhone())
                .notes(request.getNotes() != null ? request.getNotes() : "Rider requested immediate group assistance!")
                .triggeredAt(saved.getTriggeredAt())
                .build();

        // Broadcast high-priority SOS alert over STOMP WebSocket channel: /topic/ride-groups/{groupId}/sos-alert
        messagingTemplate.convertAndSend("/topic/ride-groups/" + group.getId() + "/sos-alert", alert);

        return alert;
    }

    @Transactional
    public SosEvent resolveSos(Long sosEventId) {
        SosEvent event = sosEventRepository.findById(sosEventId)
                .orElseThrow(() -> new RuntimeException("SOS Event not found: " + sosEventId));

        event.setStatus(SosStatus.RESOLVED);
        event.setResolvedAt(LocalDateTime.now());
        return sosEventRepository.save(event);
    }

    public List<SosEvent> getActiveSosEvents(Long rideGroupId) {
        return sosEventRepository.findByRideGroupIdAndStatus(rideGroupId, SosStatus.ACTIVE);
    }
}
