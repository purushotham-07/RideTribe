package com.ridetribe.repository;

import com.ridetribe.model.RideGroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RideGroupMemberRepository extends JpaRepository<RideGroupMember, Long> {
    List<RideGroupMember> findByRideGroupId(Long rideGroupId);
    Optional<RideGroupMember> findByRideGroupIdAndUserId(Long rideGroupId, Long userId);
    Boolean existsByRideGroupIdAndUserId(Long rideGroupId, Long userId);
}
