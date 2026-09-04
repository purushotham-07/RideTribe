package com.ridetribe.repository;

import com.ridetribe.model.RideGroup;
import com.ridetribe.model.RideGroupStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RideGroupRepository extends MongoRepository<RideGroup, String> {

    List<RideGroup> findAllByOrderByCreatedAtDesc();

    List<RideGroup> findByStatusOrderByScheduledTimeDesc(RideGroupStatus status);

    List<RideGroup> findByStatus(RideGroupStatus status);

    @Query("{ 'members.user.id': ?0 }")
    List<RideGroup> findGroupsByUserId(String userId);

    @Query("{ 'hostUser.id': ?0 }")
    List<RideGroup> findGroupsByHostUserId(String hostUserId);
}
