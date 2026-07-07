package com.opspilot.infra.llm;

import java.util.List;

public record AiAnalysisRequest(
        IncidentContext incident,
        List<LogContext> logs,
        List<SimilarIncidentContext> similarIncidents,
        List<RunbookContext> runbooks
) {
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

    public record LogContext(String level, String source, String message, List<String> extractedKeywords) {
    }

    public record SimilarIncidentContext(Long id, String title, int score, List<String> matchedKeywords) {
    }

    public record RunbookContext(Long id, String title, List<String> triggerKeywords, List<String> steps) {
    }
}
