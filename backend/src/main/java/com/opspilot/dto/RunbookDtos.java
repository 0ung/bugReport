package com.opspilot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

public final class RunbookDtos {
    private RunbookDtos() {
    }

    @Builder
    public record RunbookRequest(
            @NotBlank String title,
            @NotBlank String serviceName,
            @NotBlank String category,
            @NotBlank String owner,
            @NotEmpty List<String> triggerKeywords,
            @NotEmpty List<String> steps
    ) {
    }

    @Builder
    public record RunbookResponse(
            Long id,
            String title,
            String serviceName,
            String category,
            String owner,
            LocalDateTime updatedAt,
            List<String> triggerKeywords,
            List<String> steps,
            List<Long> linkedIncidentIds
    ) {
    }
}
