package com.opspilot.infra.llm;

import java.util.List;

public record AiAnalysisResponse(
        String summary,
        List<String> suspectedCauses,
        List<String> checkSteps,
        List<String> recommendedActions,
        List<Long> relatedIncidentIds,
        List<Long> relatedRunbookIds,
        int confidenceScore
) {
}
