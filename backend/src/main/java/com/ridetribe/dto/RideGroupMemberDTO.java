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
    private String id;
    private UserDTO user;
    private Boolean onMyWay;
    private Boolean isLead;
    private LocalDateTime joinedAt;

    public static RideGroupMemberDTO fromEntity(RideGroupMember member) {
        if (member == null) return null;
        return RideGroupMemberDTO.builder()
                .id(member.getId())
                .user(UserDTO.fromEntity(member.getUser()))
                .onMyWay(member.getOnMyWay())
                .isLead(member.getIsLead())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
