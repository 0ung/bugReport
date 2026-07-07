package com.opspilot.service;

import com.opspilot.dto.AiAnalysisRequest;
import com.opspilot.dto.AiAnalysisResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MockLlmClient implements LlmClient {
    private final ObjectMapper objectMapper;

    @Override
    public String analyzeIncident(AiAnalysisRequest request) {
        List<Long> relatedIncidentIds = request.similarIncidents()
                .stream()
                .map(AiAnalysisRequest.SimilarIncidentContext::id)
                .toList();
        List<Long> relatedRunbookIds = request.runbooks()
                .stream()
                .map(AiAnalysisRequest.RunbookContext::id)
                .toList();
        int confidence = request.runbooks().isEmpty() ? 58 : Math.min(92, 64 + request.runbooks().size() * 9);
        AiAnalysisResponse response = AiAnalysisResponse.builder()
                .summary(request.incident().serviceName()
                        + " incident looks related to "
                        + String.join(", ", request.incident().keywords())
                        + ". The result is grounded by logs, similar incidents, and runbooks.")
                .suspectedCauses(List.of(
                        "Repeated error keywords appear in attached logs.",
                        "Related runbooks indicate a known operational failure path.",
                        "Similar incident history should be checked before remediation."
                ))
                .checkSteps(List.of(
                        "Validate recent deployment and external provider status.",
                        "Compare service error rate with extracted log keywords.",
                        "Open the related runbooks and confirm each checklist item."
                ))
                .recommendedActions(List.of(
                        "Keep ownership with " + request.incident().serviceName() + " on-call until impact is reduced.",
                        "Apply the highest matching runbook before changing infrastructure settings.",
                        "Record the final resolution to improve future analysis grounding."
                ))
                .relatedIncidentIds(relatedIncidentIds)
                .relatedRunbookIds(relatedRunbookIds)
                .confidenceScore(confidence)
                .build();

        try {
            return objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Failed to create mock AI response", exception);
        }
    }
}
