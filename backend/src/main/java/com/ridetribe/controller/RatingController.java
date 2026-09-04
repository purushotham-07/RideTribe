package com.ridetribe.controller;

import com.ridetribe.dto.RatingDTO;
import com.ridetribe.dto.SubmitRatingRequest;
import com.ridetribe.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    public ResponseEntity<RatingDTO> submitRating(@Valid @RequestBody SubmitRatingRequest request) {
        return ResponseEntity.ok(ratingService.submitRating(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RatingDTO>> getRatingsForUser(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(ratingService.getRatingsForUser(userId));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<RatingDTO>> getRatingsForGroup(@PathVariable("groupId") String groupId) {
        return ResponseEntity.ok(ratingService.getRatingsForGroup(groupId));
    }
}
