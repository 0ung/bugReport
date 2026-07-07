package com.opspilot.dto;

import com.opspilot.entity.IncidentSource;
import com.opspilot.entity.IncidentStatus;
import com.opspilot.entity.Severity;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

public final class IncidentDtos {
    private IncidentDtos() {
    }

    @Builder
    public record CreateIncidentRequest(
            @NotBlank String title,
            @NotBlank String serviceName,
            @NotNull Severity severity,
            @NotNull IncidentSource source,
            @NotBlank String owner,
            @Min(0) int affectedUsers,
            @NotBlank String description,
            @NotBlank String rawLog
    ) {
    }

    @Builder
    public record ChangeIncidentStatusRequest(@NotNull IncidentStatus status) {
    }

    @Builder
    public record IncidentResponse(
            Long id,
            String title,
            String serviceName,
            Severity severity,
            IncidentStatus status,
            IncidentSource source,
            String owner,
            int affectedUsers,
            String description,
            LocalDateTime occurredAt,
            LocalDateTime updatedAt,
            List<String> keywords,
            List<Long> relatedRunbookIds,
            List<Long> similarIncidentIds
    ) {
    }

    @Builder
    public record IncidentDetailResponse(
            Long id,
            String title,
            String serviceName,
            Severity severity,
            IncidentStatus status,
            IncidentSource source,
            String owner,
            int affectedUsers,
            String description,
            LocalDateTime occurredAt,
            LocalDateTime updatedAt,
            List<String> keywords,
            List<IncidentLogDtos.IncidentLogResponse> logs,
            List<RunbookDtos.RunbookResponse> relatedRunbooks,
            List<SearchDtos.SimilarIncidentResponse> similarIncidents,
            AnalysisDtos.AiAnalysisResponse analysis,
            ResolutionDtos.ResolutionResponse resolution,
            AnalysisDtos.AiFeedbackResponse feedback
    ) {
    }
}
