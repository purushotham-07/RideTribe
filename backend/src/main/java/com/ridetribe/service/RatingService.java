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

import java.time.LocalDateTime;
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
            rating.setScore(request.getScore());
            rating.setComment(request.getComment());
        } else {
            rating = Rating.builder()
                    .rideGroupId(group.getId())
                    .raterId(rater.getId())
                    .rater(rater)
                    .rateeId(ratee.getId())
                    .ratee(ratee)
                    .score(request.getScore())
                    .comment(request.getComment())
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        Rating saved = ratingRepository.save(rating);

        // Recalculate ratee's average rating and total counts
        List<Rating> allRatings = ratingRepository.findByRateeId(ratee.getId());
        if (!allRatings.isEmpty()) {
            double avg = allRatings.stream().mapToDouble(Rating::getScore).average().orElse(5.0);
            ratee.setAvgRating(Math.round(avg * 10.0) / 10.0);
            ratee.setTotalRatings(allRatings.size());
            userRepository.save(ratee);
        }

        return RatingDTO.fromEntity(saved);
    }

    public List<RatingDTO> getRatingsForUser(String userId) {
        return ratingRepository.findByRateeId(userId)
                .stream()
                .map(RatingDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<RatingDTO> getRatingsForGroup(String groupId) {
        return ratingRepository.findByRideGroupId(groupId)
                .stream()
                .map(RatingDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
