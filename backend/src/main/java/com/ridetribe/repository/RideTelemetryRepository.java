package com.ridetribe.repository;

import com.ridetribe.model.RideTelemetry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RideTelemetryRepository extends MongoRepository<RideTelemetry, String> {

    List<RideTelemetry> findByRideGroupId(String rideGroupId);

    Optional<RideTelemetry> findByRideGroupIdAndUserId(String rideGroupId, String userId);

    void deleteByRideGroupId(String rideGroupId);

    void deleteByRideGroupIdAndUserId(String rideGroupId, String userId);
}
