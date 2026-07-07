package com.opspilot.domain.incident;

import com.opspilot.domain.analysis.AnalysisService;
import com.opspilot.domain.incidentlog.IncidentLog;
import com.opspilot.domain.incidentlog.IncidentLogDtos;
import com.opspilot.domain.incidentlog.IncidentLogRepository;
import com.opspilot.domain.incidentlog.LogLevel;
import com.opspilot.domain.resolution.ResolutionService;
import com.opspilot.domain.runbook.Runbook;
import com.opspilot.domain.runbook.RunbookService;
import com.opspilot.global.error.NotFoundException;
import com.opspilot.infra.search.KeywordExtractor;
import com.opspilot.infra.search.SearchDtos;
import com.opspilot.infra.search.SearchService;
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
        Incident incident = new Incident(
                request.title(),
                request.serviceName(),
                request.severity(),
                request.source(),
                request.owner(),
                request.affectedUsers(),
                request.description(),
                keywords
        );
        Incident savedIncident = incidentRepository.save(incident);
        incidentLogRepository.save(new IncidentLog(
                savedIncident,
                request.severity() == Severity.LOW ? LogLevel.WARN : LogLevel.ERROR,
                request.serviceName(),
                request.rawLog(),
                keywords
        ));
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
                .map(log -> new IncidentLogDtos.IncidentLogResponse(
                        log.getId(),
                        incidentId,
                        log.getLevel(),
                        log.getSource(),
                        log.getMessage(),
                        log.getCapturedAt(),
                        log.getExtractedKeywords()
                ))
                .toList();
        List<SearchDtos.SimilarIncidentResponse> similarIncidents = searchService.findSimilarIncidents(incident, 5);

        return new IncidentDtos.IncidentDetailResponse(
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
                logs,
                incident.getRelatedRunbookIds()
                        .stream()
                        .map(runbookService::get)
                        .toList(),
                similarIncidents,
                analysisService.getLatestOrNull(incidentId),
                resolutionService.getLatestOrNull(incidentId),
                analysisService.getFeedbackOrNull(incidentId)
        );
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
