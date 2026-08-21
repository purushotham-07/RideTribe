package com.ridetribe.service;

import com.ridetribe.dto.RideGroupDTO;
import com.ridetribe.dto.UpdateMemberStatusRequest;
import com.ridetribe.model.RideGroup;
import com.ridetribe.model.RideGroupMember;
import com.ridetribe.model.RideGroupStatus;
import com.ridetribe.model.User;
import com.ridetribe.repository.RideGroupMemberRepository;
import com.ridetribe.repository.RideGroupRepository;
import com.ridetribe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RideGroupService {

    private final RideGroupRepository rideGroupRepository;
    private final RideGroupMemberRepository rideGroupMemberRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public RideGroupDTO getGroupById(Long groupId) {
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

    @Transactional
    public RideGroupDTO startRide(Long groupId) {
        RideGroup group = rideGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Ride group not found: " + groupId));

        group.setStatus(RideGroupStatus.IN_PROGRESS);
        group.setStartedAt(LocalDateTime.now());
        RideGroup saved = rideGroupRepository.save(group);
        return RideGroupDTO.fromEntity(saved);
    }

    @Transactional
    public RideGroupDTO completeRide(Long groupId) {
        RideGroup group = rideGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Ride group not found: " + groupId));

        group.setStatus(RideGroupStatus.COMPLETED);
        group.setCompletedAt(LocalDateTime.now());
        RideGroup saved = rideGroupRepository.save(group);

        // Increment rides completed for all members
        for (RideGroupMember member : group.getMembers()) {
            User user = member.getUser();
            user.setRidesCompleted((user.getRidesCompleted() == null ? 0 : user.getRidesCompleted()) + 1);
            userRepository.save(user);
        }

        return RideGroupDTO.fromEntity(saved);
    }

    @Transactional
    public RideGroupDTO updateMemberStatus(Long groupId, UpdateMemberStatusRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        RideGroupMember member = rideGroupMemberRepository.findByRideGroupIdAndUserId(groupId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User is not a member of ride group: " + groupId));

        if (request.getOnMyWay() != null) {
            member.setOnMyWay(request.getOnMyWay());
        }
        if (request.getIsLead() != null) {
            member.setIsLead(request.getIsLead());
        }
        if (request.getCurrentLat() != null && request.getCurrentLng() != null) {
            member.setCurrentLat(request.getCurrentLat());
            member.setCurrentLng(request.getCurrentLng());
            member.setLastLocationUpdate(LocalDateTime.now());
        }

        rideGroupMemberRepository.save(member);

        RideGroup group = rideGroupRepository.findById(groupId).orElseThrow();
        return RideGroupDTO.fromEntity(group);
    }
}
