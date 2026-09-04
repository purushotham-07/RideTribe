package com.ridetribe.repository;

import com.ridetribe.model.Rating;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends MongoRepository<Rating, String> {

    List<Rating> findByRateeId(String rateeId);

    List<Rating> findByRideGroupId(String rideGroupId);

    Optional<Rating> findByRideGroupIdAndRaterIdAndRateeId(String rideGroupId, String raterId, String rateeId);

    Integer countByRateeId(String rateeId);
}
