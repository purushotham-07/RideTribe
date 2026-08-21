package com.ridetribe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchingSummaryDTO {
    private int totalIntentsProcessed;
    private int totalUsersMatched;
    private int totalGroupsFormed;
    private int unmergedPendingIntents;
    private List<MatchingClusterDTO> formedGroups;
    private String executionMessage;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
