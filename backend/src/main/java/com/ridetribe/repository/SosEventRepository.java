package com.ridetribe.repository;

import com.ridetribe.model.SosEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SosEventRepository extends MongoRepository<SosEvent, String> {

    List<SosEvent> findByRideGroupIdOrderByCreatedAtDesc(String rideGroupId);

    List<SosEvent> findByRideGroupIdAndResolved(String rideGroupId, Boolean resolved);

    void deleteByRideGroupId(String rideGroupId);
}
