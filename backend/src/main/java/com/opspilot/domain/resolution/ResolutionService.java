package com.opspilot.domain.resolution;

import com.opspilot.domain.incident.Incident;
import com.opspilot.domain.incident.IncidentRepository;
import com.opspilot.domain.incident.IncidentStatus;
import com.opspilot.global.error.NotFoundException;
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
        ResolutionHistory resolution = new ResolutionHistory(
                incident,
                request.actionSummary(),
                request.rootCause(),
                request.resolvedBy(),
                request.preventionNotes()
        );
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
        return new ResolutionDtos.ResolutionResponse(
                resolution.getId(),
                resolution.getIncident().getId(),
                resolution.getActionSummary(),
                resolution.getRootCause(),
                resolution.getResolvedBy(),
                resolution.getResolvedAt(),
                resolution.getPreventionNotes()
        );
    }
}
