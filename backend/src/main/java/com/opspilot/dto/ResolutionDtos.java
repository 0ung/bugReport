package com.opspilot.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import lombok.Builder;

public final class ResolutionDtos {
    private ResolutionDtos() {
    }

    @Builder
    public record CreateResolutionRequest(
            @NotBlank String actionSummary,
            @NotBlank String rootCause,
            @NotBlank String resolvedBy,
            String preventionNotes
    ) {
    }

    @Builder
    public record ResolutionResponse(
            Long id,
            Long incidentId,
            String actionSummary,
            String rootCause,
            String resolvedBy,
            LocalDateTime resolvedAt,
            String preventionNotes
    ) {
    }
}
