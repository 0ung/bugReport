package com.opspilot.domain.incident;

import com.opspilot.domain.analysis.AnalysisDtos;
import com.opspilot.domain.incidentlog.IncidentLogDtos;
import com.opspilot.domain.resolution.ResolutionDtos;
import com.opspilot.domain.runbook.RunbookDtos;
import com.opspilot.infra.search.SearchDtos;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public final class IncidentDtos {
    private IncidentDtos() {
    }

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

    public record ChangeIncidentStatusRequest(@NotNull IncidentStatus status) {
    }

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
