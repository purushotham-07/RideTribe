package com.ridetribe.repository;

import com.ridetribe.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByRateeId(Long rateeId);

    List<Rating> findByRideGroupId(Long rideGroupId);

    Optional<Rating> findByRideGroupIdAndRaterIdAndRateeId(Long rideGroupId, Long raterId, Long rateeId);

    @Query("SELECT AVG(r.stars) FROM Rating r WHERE r.ratee.id = :userId")
    Double calculateAverageRatingForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.ratee.id = :userId")
    Integer countRatingsForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) > 0 FROM Rating r WHERE r.rater.id = :raterId AND r.ratee.id = :rateeId AND r.wouldRideAgain = true")
    Boolean hasPositiveHistory(@Param("raterId") Long raterId, @Param("rateeId") Long rateeId);
}
