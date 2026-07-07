package com.opspilot.domain.analysis;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public final class AnalysisDtos {
    private AnalysisDtos() {
    }

    public record AiAnalysisResponse(
            Long id,
            Long incidentId,
            LocalDateTime createdAt,
            int confidenceScore,
            String summary,
            List<String> suspectedCauses,
            List<String> checkSteps,
            List<String> recommendedActions,
            List<Long> relatedIncidentIds,
            List<Long> relatedRunbookIds,
            String rawResponse
    ) {
    }

    public record CreateFeedbackRequest(
            @NotNull FeedbackRating rating,
            @NotBlank String note
    ) {
    }

    public record AiFeedbackResponse(
            Long id,
            Long incidentId,
            FeedbackRating rating,
            String note,
            LocalDateTime createdAt
    ) {
    }
}
