package com.ridetribe.service;

import com.ridetribe.dto.RatingDTO;
import com.ridetribe.dto.SubmitRatingRequest;
import com.ridetribe.model.Rating;
import com.ridetribe.model.RideGroup;
import com.ridetribe.model.User;
import com.ridetribe.repository.RatingRepository;
import com.ridetribe.repository.RideGroupRepository;
import com.ridetribe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final RideGroupRepository rideGroupRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Transactional
    public RatingDTO submitRating(SubmitRatingRequest request) {
        User rater = authService.getCurrentAuthenticatedUser();

        if (rater.getId().equals(request.getRateeId())) {
            throw new IllegalArgumentException("Cannot rate yourself");
        }

        RideGroup group = rideGroupRepository.findById(request.getRideGroupId())
                .orElseThrow(() -> new RuntimeException("Ride group not found: " + request.getRideGroupId()));

        User ratee = userRepository.findById(request.getRateeId())
                .orElseThrow(() -> new RuntimeException("Ratee user not found: " + request.getRateeId()));

        // Check if rating already exists for this pair in this group
        Optional<Rating> existing = ratingRepository.findByRideGroupIdAndRaterIdAndRateeId(
                group.getId(), rater.getId(), ratee.getId());

        Rating rating;
        if (existing.isPresent()) {
            rating = existing.get();
            rating.setStars(request.getStars());
            rating.setWouldRideAgain(request.getWouldRideAgain() != null ? request.getWouldRideAgain() : true);
            rating.setTags(request.getTags());
            rating.setComment(request.getComment());
        } else {
            rating = Rating.builder()
                    .rideGroup(group)
                    .rater(rater)
                    .ratee(ratee)
                    .stars(request.getStars())
                    .wouldRideAgain(request.getWouldRideAgain() != null ? request.getWouldRideAgain() : true)
                    .tags(request.getTags())
                    .comment(request.getComment())
                    .build();
        }

        Rating saved = ratingRepository.save(rating);

        // Recalculate ratee's average rating and total counts
        Double avgRating = ratingRepository.calculateAverageRatingForUser(ratee.getId());
        Integer count = ratingRepository.countRatingsForUser(ratee.getId());

        ratee.setAvgRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 5.0);
        ratee.setTotalRatings(count != null ? count : 0);
        userRepository.save(ratee);

        return RatingDTO.fromEntity(saved);
    }

    public List<RatingDTO> getRatingsForUser(Long userId) {
        return ratingRepository.findByRateeId(userId)
                .stream()
                .map(RatingDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<RatingDTO> getRatingsForGroup(Long groupId) {
        return ratingRepository.findByRideGroupId(groupId)
                .stream()
                .map(RatingDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
