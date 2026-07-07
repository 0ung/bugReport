package com.opspilot.dto;

import java.util.List;
import lombok.Builder;

@Builder
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
