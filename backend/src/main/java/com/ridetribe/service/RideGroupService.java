package com.ridetribe.service;

import com.ridetribe.dto.RideGroupDTO;
import com.ridetribe.dto.UpdateMemberStatusRequest;
import com.ridetribe.model.RideGroup;
import com.ridetribe.model.RideGroupMember;
import com.ridetribe.model.RideGroupStatus;
import com.ridetribe.model.User;
import com.ridetribe.repository.RideGroupRepository;
import com.ridetribe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RideGroupService {

    private final RideGroupRepository rideGroupRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public RideGroupDTO getGroupById(String groupId) {
        RideGroup group = rideGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Ride group not found: " + groupId));
        return RideGroupDTO.fromEntity(group);
    }

    public List<RideGroupDTO> getMyRideGroups() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return rideGroupRepository.findGroupsByUserId(currentUser.getId())
                .stream()
                .map(RideGroupDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<RideGroupDTO> getAllGroups() {
        return rideGroupRepository.findAll()
                .stream()
                .map(RideGroupDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public RideGroupDTO startRide(String groupId) {
        RideGroup group = rideGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Ride group not found: " + groupId));

        group.setStatus(RideGroupStatus.IN_PROGRESS);
        group.setStartedAt(LocalDateTime.now());
        RideGroup saved = rideGroupRepository.save(group);
        return RideGroupDTO.fromEntity(saved);
    }

    public RideGroupDTO completeRide(String groupId) {
        RideGroup group = rideGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Ride group not found: " + groupId));

        group.setStatus(RideGroupStatus.COMPLETED);
        group.setCompletedAt(LocalDateTime.now());
        RideGroup saved = rideGroupRepository.save(group);

        // Increment rides completed for all members
        if (group.getMembers() != null) {
            for (RideGroupMember member : group.getMembers()) {
                if (member.getUser() != null && member.getUser().getId() != null) {
                    userRepository.findById(member.getUser().getId()).ifPresent(user -> {
                        user.setRidesCompleted((user.getRidesCompleted() == null ? 0 : user.getRidesCompleted()) + 1);
                        userRepository.save(user);
                    });
                }
            }
        }

        return RideGroupDTO.fromEntity(saved);
    }

    public RideGroupDTO updateMemberStatus(String groupId, UpdateMemberStatusRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RideGroup group = rideGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Ride group not found: " + groupId));

        if (group.getMembers() != null) {
            group.getMembers().stream()
                    .filter(m -> m.getUser() != null && currentUser.getId().equals(m.getUser().getId()))
                    .findFirst()
                    .ifPresent(m -> {
                        if (request.getOnMyWay() != null) m.setOnMyWay(request.getOnMyWay());
                        if (request.getIsLead() != null) m.setIsLead(request.getIsLead());
                    });
            rideGroupRepository.save(group);
        }

        return RideGroupDTO.fromEntity(group);
    }
}
