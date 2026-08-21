package com.ridetribe.dto;

import lombok.Data;

@Data
public class UpdateMemberStatusRequest {
    private Boolean onMyWay;
    private Boolean isLead;
    private Double currentLat;
    private Double currentLng;
}
