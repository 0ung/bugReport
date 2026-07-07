package com.opspilot.service;

import com.opspilot.dto.AiAnalysisRequest;
import com.opspilot.dto.AiAnalysisResponse;
import com.opspilot.dto.AnalysisDtos;
import com.opspilot.dto.SearchDtos;
import com.opspilot.entity.AiAnalysis;
import com.opspilot.entity.AiFeedback;
import com.opspilot.entity.Incident;
import com.opspilot.entity.IncidentLog;
import com.opspilot.entity.IncidentStatus;
import com.opspilot.entity.Runbook;
import com.opspilot.exception.NotFoundException;
import com.opspilot.repository.AiAnalysisRepository;
import com.opspilot.repository.AiFeedbackRepository;
import com.opspilot.repository.IncidentLogRepository;
import com.opspilot.repository.IncidentRepository;
import com.opspilot.repository.RunbookRepository;

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
        AiAnalysisResponse parsed = llmJsonParser.parse(rawResponse);
        AiAnalysis analysis = AiAnalysis.builder()
                .incident(incident)
                .confidenceScore(parsed.confidenceScore())
                .summary(parsed.summary())
                .suspectedCauses(parsed.suspectedCauses())
                .checkSteps(parsed.checkSteps())
                .recommendedActions(parsed.recommendedActions())
                .relatedIncidentIds(parsed.relatedIncidentIds())
                .relatedRunbookIds(parsed.relatedRunbookIds())
                .rawResponse(rawResponse)
                .build();
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
        AiFeedback feedback = AiFeedback.builder()
                .incident(incident)
                .rating(request.rating())
                .note(request.note())
                .build();
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
        return AiAnalysisRequest.builder()
                .incident(AiAnalysisRequest.IncidentContext.builder()
                        .id(incident.getId())
                        .title(incident.getTitle())
                        .serviceName(incident.getServiceName())
                        .severity(incident.getSeverity().name())
                        .status(incident.getStatus().name())
                        .description(incident.getDescription())
                        .keywords(incident.getKeywords())
                        .build())
                .logs(logs.stream()
                        .map(log -> AiAnalysisRequest.LogContext.builder()
                                .level(log.getLevel().name())
                                .source(log.getSource())
                                .message(log.getMessage())
                                .extractedKeywords(log.getExtractedKeywords())
                                .build())
                        .toList())
                .similarIncidents(similarIncidents.stream()
                        .map(item -> AiAnalysisRequest.SimilarIncidentContext.builder()
                                .id(item.incidentId())
                                .title(item.title())
                                .score(item.score())
                                .matchedKeywords(item.matchedKeywords())
                                .build())
                        .toList())
                .runbooks(runbooks.stream()
                        .map(runbook -> AiAnalysisRequest.RunbookContext.builder()
                                .id(runbook.getId())
                                .title(runbook.getTitle())
                                .triggerKeywords(runbook.getTriggerKeywords())
                                .steps(runbook.getSteps())
                                .build())
                        .toList())
                .build();
    }

    private AnalysisDtos.AiAnalysisResponse toResponse(AiAnalysis analysis) {
        return AnalysisDtos.AiAnalysisResponse.builder()
                .id(analysis.getId())
                .incidentId(analysis.getIncident().getId())
                .createdAt(analysis.getCreatedAt())
                .confidenceScore(analysis.getConfidenceScore())
                .summary(analysis.getSummary())
                .suspectedCauses(analysis.getSuspectedCauses())
                .checkSteps(analysis.getCheckSteps())
                .recommendedActions(analysis.getRecommendedActions())
                .relatedIncidentIds(analysis.getRelatedIncidentIds())
                .relatedRunbookIds(analysis.getRelatedRunbookIds())
                .rawResponse(analysis.getRawResponse())
                .build();
    }

    private AnalysisDtos.AiFeedbackResponse toFeedbackResponse(AiFeedback feedback) {
        return AnalysisDtos.AiFeedbackResponse.builder()
                .id(feedback.getId())
                .incidentId(feedback.getIncident().getId())
                .rating(feedback.getRating())
                .note(feedback.getNote())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}
