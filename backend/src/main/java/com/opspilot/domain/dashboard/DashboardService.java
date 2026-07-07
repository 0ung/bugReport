package com.opspilot.domain.dashboard;

import com.opspilot.domain.analysis.AiAnalysisRepository;
import com.opspilot.domain.incident.Incident;
import com.opspilot.domain.incident.IncidentDtos;
import com.opspilot.domain.incident.IncidentRepository;
import com.opspilot.domain.incident.IncidentStatus;
import com.opspilot.domain.incident.Severity;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private final IncidentRepository incidentRepository;
    private final AiAnalysisRepository aiAnalysisRepository;

    public DashboardService(IncidentRepository incidentRepository, AiAnalysisRepository aiAnalysisRepository) {
        this.incidentRepository = incidentRepository;
        this.aiAnalysisRepository = aiAnalysisRepository;
    }

    public DashboardDtos.DashboardResponse getDashboard() {
        return new DashboardDtos.DashboardResponse(
                getSummary(),
                getSeverityStats(),
                getTopKeywords(),
                getRecentIncidents()
        );
    }

    public DashboardDtos.IncidentSummaryResponse getSummary() {
        long total = incidentRepository.count();
        long open = incidentRepository.countByStatusIn(List.of(IncidentStatus.OPEN, IncidentStatus.ANALYZING));
        long highRisk = incidentRepository.countBySeverityIn(List.of(Severity.HIGH, Severity.CRITICAL));
        long resolved = incidentRepository.countByStatusIn(List.of(IncidentStatus.RESOLVED, IncidentStatus.CLOSED));

        return new DashboardDtos.IncidentSummaryResponse(
                total,
                open,
                highRisk,
                aiAnalysisRepository.count(),
                resolved
        );
    }

    public List<DashboardDtos.SeverityStatResponse> getSeverityStats() {
        return List.of(Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.LOW)
                .stream()
                .map(severity -> new DashboardDtos.SeverityStatResponse(
                        severity,
                        incidentRepository.findAll()
                                .stream()
                                .filter(incident -> incident.getSeverity() == severity)
                                .count()
                ))
                .toList();
    }

    public List<DashboardDtos.KeywordStatResponse> getTopKeywords() {
        Map<String, Long> counts = incidentRepository.findAll()
                .stream()
                .map(Incident::getKeywords)
                .flatMap(Collection::stream)
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

        return counts.entrySet()
                .stream()
                .map(entry -> new DashboardDtos.KeywordStatResponse(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparingLong(DashboardDtos.KeywordStatResponse::count).reversed())
                .limit(10)
                .toList();
    }

    public List<IncidentDtos.IncidentResponse> getRecentIncidents() {
        return incidentRepository.findTop5ByOrderByUpdatedAtDesc()
                .stream()
                .map(this::toIncidentResponse)
                .toList();
    }

    private IncidentDtos.IncidentResponse toIncidentResponse(Incident incident) {
        return new IncidentDtos.IncidentResponse(
                incident.getId(),
                incident.getTitle(),
                incident.getServiceName(),
                incident.getSeverity(),
                incident.getStatus(),
                incident.getSource(),
                incident.getOwner(),
                incident.getAffectedUsers(),
                incident.getDescription(),
                incident.getOccurredAt(),
                incident.getUpdatedAt(),
                incident.getKeywords(),
                incident.getRelatedRunbookIds(),
                incident.getSimilarIncidentIds()
        );
    }
}
