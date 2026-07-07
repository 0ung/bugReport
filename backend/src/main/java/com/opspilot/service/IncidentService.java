package com.opspilot.service;

import com.opspilot.dto.IncidentDtos;
import com.opspilot.dto.IncidentLogDtos;
import com.opspilot.dto.SearchDtos;
import com.opspilot.entity.Incident;
import com.opspilot.entity.IncidentLog;
import com.opspilot.entity.LogLevel;
import com.opspilot.entity.Runbook;
import com.opspilot.entity.Severity;
import com.opspilot.exception.NotFoundException;
import com.opspilot.repository.IncidentLogRepository;
import com.opspilot.repository.IncidentRepository;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class IncidentService {
    private final IncidentRepository incidentRepository;
    private final IncidentLogRepository incidentLogRepository;
    private final KeywordExtractor keywordExtractor;
    private final SearchService searchService;
    private final RunbookService runbookService;
    private final AnalysisService analysisService;
    private final ResolutionService resolutionService;

    public IncidentDtos.IncidentDetailResponse create(IncidentDtos.CreateIncidentRequest request) {
        List<String> keywords = keywordExtractor.extract(
                request.title() + "\n" + request.description() + "\n" + request.rawLog()
        );
        Incident incident = Incident.builder()
                .title(request.title())
                .serviceName(request.serviceName())
                .severity(request.severity())
                .source(request.source())
                .owner(request.owner())
                .affectedUsers(request.affectedUsers())
                .description(request.description())
                .keywords(keywords)
                .build();
        Incident savedIncident = incidentRepository.save(incident);
        incidentLogRepository.save(IncidentLog.builder()
                .incident(savedIncident)
                .level(request.severity() == Severity.LOW ? LogLevel.WARN : LogLevel.ERROR)
                .source(request.serviceName())
                .message(request.rawLog())
                .extractedKeywords(keywords)
                .build());
        refreshSearchLinks(savedIncident);
        return getDetail(savedIncident.getId());
    }

    @Transactional(readOnly = true)
    public List<IncidentDtos.IncidentResponse> findAll() {
        return incidentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public IncidentDtos.IncidentDetailResponse getDetail(Long incidentId) {
        Incident incident = findEntity(incidentId);
        List<IncidentLogDtos.IncidentLogResponse> logs = incidentLogRepository
                .findByIncidentIdOrderByCapturedAtAsc(incidentId)
                .stream()
                .map(log -> IncidentLogDtos.IncidentLogResponse.builder()
                        .id(log.getId())
                        .incidentId(incidentId)
                        .level(log.getLevel())
                        .source(log.getSource())
                        .message(log.getMessage())
                        .capturedAt(log.getCapturedAt())
                        .extractedKeywords(log.getExtractedKeywords())
                        .build())
                .toList();
        List<SearchDtos.SimilarIncidentResponse> similarIncidents = searchService.findSimilarIncidents(incident, 5);

        return IncidentDtos.IncidentDetailResponse.builder()
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
                .logs(logs)
                .relatedRunbooks(incident.getRelatedRunbookIds()
                        .stream()
                        .map(runbookService::get)
                        .toList())
                .similarIncidents(similarIncidents)
                .analysis(analysisService.getLatestOrNull(incidentId))
                .resolution(resolutionService.getLatestOrNull(incidentId))
                .feedback(analysisService.getFeedbackOrNull(incidentId))
                .build();
    }

    public IncidentDtos.IncidentResponse changeStatus(
            Long incidentId,
            IncidentDtos.ChangeIncidentStatusRequest request
    ) {
        Incident incident = findEntity(incidentId);
        incident.changeStatus(request.status());
        return toResponse(incident);
    }

    Incident findEntity(Long incidentId) {
        return incidentRepository.findById(incidentId)
                .orElseThrow(() -> new NotFoundException("Incident not found: " + incidentId));
    }

    public IncidentDtos.IncidentResponse toResponse(Incident incident) {
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

    private void refreshSearchLinks(Incident incident) {
        List<Long> relatedRunbookIds = searchService.findRelatedRunbooks(incident.getKeywords())
                .stream()
                .map(Runbook::getId)
                .toList();
        incident.setRelatedRunbookIds(relatedRunbookIds);

        List<Long> similarIncidentIds = searchService.findSimilarIncidents(incident, 5)
                .stream()
                .map(SearchDtos.SimilarIncidentResponse::incidentId)
                .toList();
        incident.setSimilarIncidentIds(similarIncidentIds);
    }
}
