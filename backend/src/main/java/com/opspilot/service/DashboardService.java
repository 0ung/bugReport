package com.opspilot.service;

import com.opspilot.dto.DashboardDtos;
import com.opspilot.dto.IncidentDtos;
import com.opspilot.entity.Incident;
import com.opspilot.entity.IncidentStatus;
import com.opspilot.entity.Severity;
import com.opspilot.repository.AiAnalysisRepository;
import com.opspilot.repository.IncidentRepository;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DashboardService {
    private final IncidentRepository incidentRepository;
    private final AiAnalysisRepository aiAnalysisRepository;

    public DashboardDtos.DashboardResponse getDashboard() {
        return DashboardDtos.DashboardResponse.builder()
                .summary(getSummary())
                .severityStats(getSeverityStats())
                .topKeywords(getTopKeywords())
                .recentIncidents(getRecentIncidents())
                .build();
    }

    public DashboardDtos.IncidentSummaryResponse getSummary() {
        long total = incidentRepository.count();
        long open = incidentRepository.countByStatusIn(List.of(IncidentStatus.OPEN, IncidentStatus.ANALYZING));
        long highRisk = incidentRepository.countBySeverityIn(List.of(Severity.HIGH, Severity.CRITICAL));
        long resolved = incidentRepository.countByStatusIn(List.of(IncidentStatus.RESOLVED, IncidentStatus.CLOSED));

        return DashboardDtos.IncidentSummaryResponse.builder()
                .total(total)
                .open(open)
                .highRisk(highRisk)
                .analyzed(aiAnalysisRepository.count())
                .resolved(resolved)
                .build();
    }

    public List<DashboardDtos.SeverityStatResponse> getSeverityStats() {
        return List.of(Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.LOW)
                .stream()
                .map(severity -> DashboardDtos.SeverityStatResponse.builder()
                        .severity(severity)
                        .count(incidentRepository.findAll()
                                .stream()
                                .filter(incident -> incident.getSeverity() == severity)
                                .count())
                        .build())
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
                .map(entry -> DashboardDtos.KeywordStatResponse.builder()
                        .keyword(entry.getKey())
                        .count(entry.getValue())
                        .build())
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
        return IncidentDtos.IncidentResponse.builder()
                .id(incident.getId())
                .title(incident.getTitle())
                .serviceName(incident.getServiceName())
                .severity(incident.getSeverity())
                .status(incident.getStatus())
                .source(incident.getSource())
                .owner(incident.getOwner())
                .affectedUsers(incident.getAffectedUsers())
                .description(incident.getDescription())
                .occurredAt(incident.getOccurredAt())
                .updatedAt(incident.getUpdatedAt())
                .keywords(incident.getKeywords())
                .relatedRunbookIds(incident.getRelatedRunbookIds())
                .similarIncidentIds(incident.getSimilarIncidentIds())
                .build();
    }
}
