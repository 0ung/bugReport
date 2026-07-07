package com.opspilot.dto;

import com.opspilot.entity.LogLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

public final class IncidentLogDtos {
    private IncidentLogDtos() {
    }

    @Builder
    public record CreateIncidentLogRequest(
            @NotNull LogLevel level,
            @NotBlank String source,
            @NotBlank String message
    ) {
    }

    @Builder
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
