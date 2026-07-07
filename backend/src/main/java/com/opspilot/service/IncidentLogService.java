package com.opspilot.service;

import com.opspilot.dto.IncidentLogDtos;
import com.opspilot.entity.Incident;
import com.opspilot.entity.IncidentLog;
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
public class IncidentLogService {
    private final IncidentRepository incidentRepository;
    private final IncidentLogRepository incidentLogRepository;
    private final KeywordExtractor keywordExtractor;

    public IncidentLogDtos.IncidentLogResponse create(
            Long incidentId,
            IncidentLogDtos.CreateIncidentLogRequest request
    ) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new NotFoundException("Incident not found: " + incidentId));
        List<String> extractedKeywords = keywordExtractor.extract(request.message());
        IncidentLog log = IncidentLog.builder()
                .incident(incident)
                .level(request.level())
                .source(request.source())
                .message(request.message())
                .extractedKeywords(extractedKeywords)
                .build();
        incident.setKeywords(mergeKeywords(incident.getKeywords(), extractedKeywords));
        incident.touch();
        return toResponse(incidentLogRepository.save(log));
    }

    @Transactional(readOnly = true)
    public List<IncidentLogDtos.IncidentLogResponse> findByIncidentId(Long incidentId) {
        return incidentLogRepository.findByIncidentIdOrderByCapturedAtAsc(incidentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private List<String> mergeKeywords(List<String> existing, List<String> extracted) {
        return java.util.stream.Stream.concat(existing.stream(), extracted.stream())
                .distinct()
                .toList();
    }

    public IncidentLogDtos.IncidentLogResponse toResponse(IncidentLog log) {
        return IncidentLogDtos.IncidentLogResponse.builder()
                .id(log.getId())
                .incidentId(log.getIncident().getId())
                .level(log.getLevel())
                .source(log.getSource())
                .message(log.getMessage())
                .capturedAt(log.getCapturedAt())
                .extractedKeywords(log.getExtractedKeywords())
                .build();
    }
}
