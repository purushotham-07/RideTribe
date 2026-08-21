package com.ridetribe.dto;

import com.ridetribe.model.RideGroupMember;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideGroupMemberDTO {
    private Long id;
    private UserDTO user;
    private Boolean onMyWay;
    private Boolean isLead;
    private Double currentLat;
    private Double currentLng;
    private Double currentSpeed;
    private Double currentHeading;
    private LocalDateTime lastLocationUpdate;
    private LocalDateTime joinedAt;

    public static RideGroupMemberDTO fromEntity(RideGroupMember member) {
        if (member == null) return null;
        return RideGroupMemberDTO.builder()
                .id(member.getId())
                .user(UserDTO.fromEntity(member.getUser()))
                .onMyWay(member.getOnMyWay())
                .isLead(member.getIsLead())
                .currentLat(member.getCurrentLat())
                .currentLng(member.getCurrentLng())
                .currentSpeed(member.getCurrentSpeed())
                .currentHeading(member.getCurrentHeading())
                .lastLocationUpdate(member.getLastLocationUpdate())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
