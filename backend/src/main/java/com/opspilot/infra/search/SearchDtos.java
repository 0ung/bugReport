package com.opspilot.infra.search;

import com.opspilot.domain.incident.IncidentStatus;
import java.util.List;

public final class SearchDtos {
    private SearchDtos() {
    }

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
