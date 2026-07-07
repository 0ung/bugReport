package com.opspilot.domain.dashboard;

import com.opspilot.domain.incident.IncidentDtos;
import com.opspilot.domain.incident.Severity;
import java.util.List;

public final class DashboardDtos {
    private DashboardDtos() {
    }

    public record IncidentSummaryResponse(
            long total,
            long open,
            long highRisk,
            long analyzed,
            long resolved
    ) {
    }

    public record SeverityStatResponse(Severity severity, long count) {
    }

    public record KeywordStatResponse(String keyword, long count) {
    }

    public record DashboardResponse(
            IncidentSummaryResponse summary,
            List<SeverityStatResponse> severityStats,
            List<KeywordStatResponse> topKeywords,
            List<IncidentDtos.IncidentResponse> recentIncidents
    ) {
    }
}
