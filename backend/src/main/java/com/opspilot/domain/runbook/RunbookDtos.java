package com.opspilot.domain.runbook;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDateTime;
import java.util.List;

public final class RunbookDtos {
    private RunbookDtos() {
    }

    public record RunbookRequest(
            @NotBlank String title,
            @NotBlank String serviceName,
            @NotBlank String category,
            @NotBlank String owner,
            @NotEmpty List<String> triggerKeywords,
            @NotEmpty List<String> steps
    ) {
    }

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
