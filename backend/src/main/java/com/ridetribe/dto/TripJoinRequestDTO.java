package com.ridetribe.dto;

import com.ridetribe.model.JoinRequestStatus;
import com.ridetribe.model.TripJoinRequest;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripJoinRequestDTO {
    private String id;
    private String tripId;
    private UserDTO user;
    private JoinRequestStatus status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;

    public static TripJoinRequestDTO fromEntity(TripJoinRequest req) {
        if (req == null) return null;
        return TripJoinRequestDTO.builder()
                .id(req.getId())
                .tripId(req.getTripId())
                .user(UserDTO.fromEntity(req.getUser()))
                .status(req.getStatus())
                .message(req.getMessage())
                .createdAt(req.getCreatedAt())
                .respondedAt(req.getRespondedAt())
                .build();
    }
}
