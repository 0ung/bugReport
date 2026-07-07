package com.opspilot.domain.resolution;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public final class ResolutionDtos {
    private ResolutionDtos() {
    }

    public record CreateResolutionRequest(
            @NotBlank String actionSummary,
            @NotBlank String rootCause,
            @NotBlank String resolvedBy,
            String preventionNotes
    ) {
    }

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
