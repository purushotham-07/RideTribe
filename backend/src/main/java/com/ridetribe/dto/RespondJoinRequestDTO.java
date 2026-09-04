package com.ridetribe.dto;

import com.ridetribe.model.JoinRequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespondJoinRequestDTO {
    @NotNull
    private JoinRequestStatus status; // APPROVED or REJECTED
}
