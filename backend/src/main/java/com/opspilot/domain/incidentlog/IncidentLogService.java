package com.opspilot.domain.incidentlog;

import com.opspilot.domain.incident.Incident;
import com.opspilot.domain.incident.IncidentRepository;
import com.opspilot.global.error.NotFoundException;
import com.opspilot.infra.search.KeywordExtractor;
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
        IncidentLog log = new IncidentLog(
                incident,
                request.level(),
                request.source(),
                request.message(),
                extractedKeywords
        );
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
        return new IncidentLogDtos.IncidentLogResponse(
                log.getId(),
                log.getIncident().getId(),
                log.getLevel(),
                log.getSource(),
                log.getMessage(),
                log.getCapturedAt(),
                log.getExtractedKeywords()
        );
    }
}
