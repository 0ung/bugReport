package com.opspilot.dto;

import com.opspilot.entity.IncidentStatus;
import java.util.List;
import lombok.Builder;

public final class SearchDtos {
    private SearchDtos() {
    }

    @Builder
    public record SimilarIncidentResponse(
            Long incidentId,
            String title,
            String serviceName,
            IncidentStatus status,
            List<String> matchedKeywords,
            int score
    ) {
    }
}
