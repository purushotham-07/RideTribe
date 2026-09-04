package com.ridetribe.repository;

import com.ridetribe.model.TripChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripChatMessageRepository extends MongoRepository<TripChatMessage, String> {

    List<TripChatMessage> findByTripIdOrderBySentAtAsc(String tripId);

    void deleteByTripId(String tripId);
}
