package com.ridetribe.repository;

import com.ridetribe.model.RideIntent;
import com.ridetribe.model.RideIntentStatus;
import com.ridetribe.model.TravelMode;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RideIntentRepository extends MongoRepository<RideIntent, String> {

    List<RideIntent> findByUserIdOrderByCreatedAtDesc(String userId);

    List<RideIntent> findByStatus(RideIntentStatus status);

    List<RideIntent> findByStatusAndRideDateGreaterThanEqual(RideIntentStatus status, LocalDate minDate);

    List<RideIntent> findByDestinationIgnoreCaseAndTravelModeAndStatusAndRideDate(
            String destination,
            TravelMode travelMode,
            RideIntentStatus status,
            LocalDate rideDate
    );

    List<RideIntent> findByStatusAndRideDate(RideIntentStatus status, LocalDate rideDate);
}
