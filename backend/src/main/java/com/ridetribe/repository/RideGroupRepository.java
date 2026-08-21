package com.ridetribe.repository;

import com.ridetribe.model.RideGroup;
import com.ridetribe.model.RideGroupStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RideGroupRepository extends JpaRepository<RideGroup, Long> {

    List<RideGroup> findByStatusOrderByScheduledTimeDesc(RideGroupStatus status);

    @Query("SELECT g FROM RideGroup g JOIN g.members m WHERE m.user.id = :userId ORDER BY g.createdAt DESC")
    List<RideGroup> findGroupsByUserId(@Param("userId") Long userId);
}
