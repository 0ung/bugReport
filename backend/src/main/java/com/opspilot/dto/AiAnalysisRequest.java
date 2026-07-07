package com.opspilot.dto;

import java.util.List;
import lombok.Builder;

@Builder
public record AiAnalysisRequest(
        IncidentContext incident,
        List<LogContext> logs,
        List<SimilarIncidentContext> similarIncidents,
        List<RunbookContext> runbooks
) {
    @Builder
    public record IncidentContext(
            Long id,
            String title,
            String serviceName,
            String severity,
            String status,
            String description,
            List<String> keywords
    ) {
    }

    @Builder
    public record LogContext(String level, String source, String message, List<String> extractedKeywords) {
    }

    @Builder
    public record SimilarIncidentContext(Long id, String title, int score, List<String> matchedKeywords) {
    }

    @Builder
    public record RunbookContext(Long id, String title, List<String> triggerKeywords, List<String> steps) {
    }
}
