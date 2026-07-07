package com.opspilot.dto;

import com.opspilot.entity.Severity;
import java.util.List;
import lombok.Builder;

public final class DashboardDtos {
    private DashboardDtos() {
    }

    @Builder
    public record IncidentSummaryResponse(
            long total,
            long open,
            long highRisk,
            long analyzed,
            long resolved
    ) {
    }

    @Builder
    public record SeverityStatResponse(Severity severity, long count) {
    }

    @Builder
    public record KeywordStatResponse(String keyword, long count) {
    }

    @Builder
    public record DashboardResponse(
            IncidentSummaryResponse summary,
            List<SeverityStatResponse> severityStats,
            List<KeywordStatResponse> topKeywords,
            List<IncidentDtos.IncidentResponse> recentIncidents
    ) {
    }
}
