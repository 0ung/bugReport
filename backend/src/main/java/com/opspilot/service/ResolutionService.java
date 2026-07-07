package com.opspilot.service;

import com.opspilot.dto.ResolutionDtos;
import com.opspilot.entity.Incident;
import com.opspilot.entity.IncidentStatus;
import com.opspilot.entity.ResolutionHistory;
import com.opspilot.exception.NotFoundException;
import com.opspilot.repository.IncidentRepository;
import com.opspilot.repository.ResolutionHistoryRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class ResolutionService {
    private final IncidentRepository incidentRepository;
    private final ResolutionHistoryRepository resolutionHistoryRepository;

    public ResolutionDtos.ResolutionResponse create(
            Long incidentId,
            ResolutionDtos.CreateResolutionRequest request
    ) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new NotFoundException("Incident not found: " + incidentId));
        ResolutionHistory resolution = ResolutionHistory.builder()
                .incident(incident)
                .actionSummary(request.actionSummary())
                .rootCause(request.rootCause())
                .resolvedBy(request.resolvedBy())
                .preventionNotes(request.preventionNotes())
                .build();
        incident.changeStatus(IncidentStatus.RESOLVED);
        return toResponse(resolutionHistoryRepository.save(resolution));
    }

    @Transactional(readOnly = true)
    public ResolutionDtos.ResolutionResponse getLatest(Long incidentId) {
        return resolutionHistoryRepository.findTopByIncidentIdOrderByResolvedAtDesc(incidentId)
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Resolution not found for incident: " + incidentId));
    }

    @Transactional(readOnly = true)
    public ResolutionDtos.ResolutionResponse getLatestOrNull(Long incidentId) {
        return resolutionHistoryRepository.findTopByIncidentIdOrderByResolvedAtDesc(incidentId)
                .map(this::toResponse)
                .orElse(null);
    }

    private ResolutionDtos.ResolutionResponse toResponse(ResolutionHistory resolution) {
        return ResolutionDtos.ResolutionResponse.builder()
                .id(resolution.getId())
                .incidentId(resolution.getIncident().getId())
                .actionSummary(resolution.getActionSummary())
                .rootCause(resolution.getRootCause())
                .resolvedBy(resolution.getResolvedBy())
                .resolvedAt(resolution.getResolvedAt())
                .preventionNotes(resolution.getPreventionNotes())
                .build();
    }
}
