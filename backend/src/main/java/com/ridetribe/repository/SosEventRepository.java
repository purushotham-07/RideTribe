package com.ridetribe.repository;

import com.ridetribe.model.SosEvent;
import com.ridetribe.model.SosStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SosEventRepository extends JpaRepository<SosEvent, Long> {
    List<SosEvent> findByRideGroupIdOrderByTriggeredAtDesc(Long rideGroupId);
    List<SosEvent> findByRideGroupIdAndStatus(Long rideGroupId, SosStatus status);
}
