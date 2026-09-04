package com.ridetribe.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "trip_chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripChatMessage {

    @Id
    private String id;

    @Indexed
    private String tripId;

    private User sender;

    private String content;

    @Builder.Default
    private LocalDateTime sentAt = LocalDateTime.now();
}
