package com.ridetribe.dto;

import com.ridetribe.model.TripChatMessage;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripChatMessageDTO {
    private String id;
    private String tripId;
    private UserDTO sender;
    private String content;
    private LocalDateTime sentAt;

    public static TripChatMessageDTO fromEntity(TripChatMessage msg) {
        if (msg == null) return null;
        return TripChatMessageDTO.builder()
                .id(msg.getId())
                .tripId(msg.getTripId())
                .sender(UserDTO.fromEntity(msg.getSender()))
                .content(msg.getContent())
                .sentAt(msg.getSentAt())
                .build();
    }
}
