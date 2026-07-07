package com.opspilot.domain.analysis;

import com.opspilot.domain.incident.Incident;
import com.opspilot.domain.incident.IncidentRepository;
import com.opspilot.domain.incident.IncidentStatus;
import com.opspilot.domain.incidentlog.IncidentLog;
import com.opspilot.domain.incidentlog.IncidentLogRepository;
import com.opspilot.domain.runbook.Runbook;
import com.opspilot.domain.runbook.RunbookRepository;
import com.opspilot.global.error.NotFoundException;
import com.opspilot.infra.llm.AiAnalysisRequest;
import com.opspilot.infra.llm.LlmClient;
import com.opspilot.infra.llm.LlmJsonParser;
import com.opspilot.infra.search.SearchDtos;
import com.opspilot.infra.search.SearchService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class AnalysisService {
    private final IncidentRepository incidentRepository;
    private final IncidentLogRepository incidentLogRepository;
    private final RunbookRepository runbookRepository;
    private final AiAnalysisRepository aiAnalysisRepository;
    private final AiFeedbackRepository aiFeedbackRepository;
    private final SearchService searchService;
    private final LlmClient llmClient;
    private final LlmJsonParser llmJsonParser;

    public AnalysisDtos.AiAnalysisResponse requestAnalysis(Long incidentId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new NotFoundException("Incident not found: " + incidentId));
        List<IncidentLog> logs = incidentLogRepository.findByIncidentIdOrderByCapturedAtAsc(incidentId);
        List<SearchDtos.SimilarIncidentResponse> similarIncidents = searchService.findSimilarIncidents(incident, 5);
        List<Runbook> runbooks = incident.getRelatedRunbookIds()
                .stream()
                .map(id -> runbookRepository.findById(id)
                        .orElseThrow(() -> new NotFoundException("Runbook not found: " + id)))
                .toList();
        AiAnalysisRequest request = buildRequest(incident, logs, similarIncidents, runbooks);
        String rawResponse = llmClient.analyzeIncident(request);
        com.opspilot.infra.llm.AiAnalysisResponse parsed = llmJsonParser.parse(rawResponse);
        AiAnalysis analysis = new AiAnalysis(
                incident,
                parsed.confidenceScore(),
                parsed.summary(),
                parsed.suspectedCauses(),
                parsed.checkSteps(),
                parsed.recommendedActions(),
                parsed.relatedIncidentIds(),
                parsed.relatedRunbookIds(),
                rawResponse
        );
        incident.changeStatus(IncidentStatus.ANALYZING);
        return toResponse(aiAnalysisRepository.save(analysis));
    }

    @Transactional(readOnly = true)
    public AnalysisDtos.AiAnalysisResponse getLatest(Long incidentId) {
        return aiAnalysisRepository.findTopByIncidentIdOrderByCreatedAtDesc(incidentId)
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("AI analysis not found for incident: " + incidentId));
    }

    @Transactional(readOnly = true)
    public AnalysisDtos.AiAnalysisResponse getLatestOrNull(Long incidentId) {
        return aiAnalysisRepository.findTopByIncidentIdOrderByCreatedAtDesc(incidentId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<AnalysisDtos.AiAnalysisResponse> findAll() {
        return aiAnalysisRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AnalysisDtos.AiFeedbackResponse createFeedback(
            Long incidentId,
            AnalysisDtos.CreateFeedbackRequest request
    ) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new NotFoundException("Incident not found: " + incidentId));
        AiFeedback feedback = new AiFeedback(incident, request.rating(), request.note());
        return toFeedbackResponse(aiFeedbackRepository.save(feedback));
    }

    @Transactional(readOnly = true)
    public AnalysisDtos.AiFeedbackResponse getFeedbackOrNull(Long incidentId) {
        return aiFeedbackRepository.findTopByIncidentIdOrderByCreatedAtDesc(incidentId)
                .map(this::toFeedbackResponse)
                .orElse(null);
    }

    private AiAnalysisRequest buildRequest(
            Incident incident,
            List<IncidentLog> logs,
            List<SearchDtos.SimilarIncidentResponse> similarIncidents,
            List<Runbook> runbooks
    ) {
        return new AiAnalysisRequest(
                new AiAnalysisRequest.IncidentContext(
                        incident.getId(),
                        incident.getTitle(),
                        incident.getServiceName(),
                        incident.getSeverity().name(),
                        incident.getStatus().name(),
                        incident.getDescription(),
                        incident.getKeywords()
                ),
                logs.stream()
                        .map(log -> new AiAnalysisRequest.LogContext(
                                log.getLevel().name(),
                                log.getSource(),
                                log.getMessage(),
                                log.getExtractedKeywords()
                        ))
                        .toList(),
                similarIncidents.stream()
                        .map(item -> new AiAnalysisRequest.SimilarIncidentContext(
                                item.incidentId(),
                                item.title(),
                                item.score(),
                                item.matchedKeywords()
                        ))
                        .toList(),
                runbooks.stream()
                        .map(runbook -> new AiAnalysisRequest.RunbookContext(
                                runbook.getId(),
                                runbook.getTitle(),
                                runbook.getTriggerKeywords(),
                                runbook.getSteps()
                        ))
                        .toList()
        );
    }

    private AnalysisDtos.AiAnalysisResponse toResponse(AiAnalysis analysis) {
        return new AnalysisDtos.AiAnalysisResponse(
                analysis.getId(),
                analysis.getIncident().getId(),
                analysis.getCreatedAt(),
                analysis.getConfidenceScore(),
                analysis.getSummary(),
                analysis.getSuspectedCauses(),
                analysis.getCheckSteps(),
                analysis.getRecommendedActions(),
                analysis.getRelatedIncidentIds(),
                analysis.getRelatedRunbookIds(),
                analysis.getRawResponse()
        );
    }

    private AnalysisDtos.AiFeedbackResponse toFeedbackResponse(AiFeedback feedback) {
        return new AnalysisDtos.AiFeedbackResponse(
                feedback.getId(),
                feedback.getIncident().getId(),
                feedback.getRating(),
                feedback.getNote(),
                feedback.getCreatedAt()
        );
    }
}
