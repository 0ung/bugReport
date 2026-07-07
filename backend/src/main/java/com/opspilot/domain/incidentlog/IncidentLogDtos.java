package com.opspilot.domain.incidentlog;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public final class IncidentLogDtos {
    private IncidentLogDtos() {
    }

    public record CreateIncidentLogRequest(
            @NotNull LogLevel level,
            @NotBlank String source,
            @NotBlank String message
    ) {
    }

    public record IncidentLogResponse(
            Long id,
            Long incidentId,
            LogLevel level,
            String source,
            String message,
            LocalDateTime capturedAt,
            List<String> extractedKeywords
    ) {
    }
}
