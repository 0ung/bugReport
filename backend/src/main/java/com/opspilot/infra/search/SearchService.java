package com.opspilot.infra.search;

import com.opspilot.domain.incident.Incident;
import com.opspilot.domain.incident.IncidentRepository;
import com.opspilot.domain.runbook.Runbook;
import com.opspilot.domain.runbook.RunbookRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SearchService {
    private final IncidentRepository incidentRepository;
    private final RunbookRepository runbookRepository;

    public List<Incident> searchIncidents(String keyword) {
        String normalized = normalize(keyword);
        return incidentRepository.findAll()
                .stream()
                .filter(incident ->
                        contains(incident.getTitle(), normalized)
                                || contains(incident.getDescription(), normalized)
                                || incident.getKeywords().stream().anyMatch(item -> contains(item, normalized)))
                .toList();
    }

    public List<Runbook> searchRunbooks(String keyword) {
        String normalized = normalize(keyword);
        return runbookRepository.findAll()
                .stream()
                .filter(runbook ->
                        contains(runbook.getTitle(), normalized)
                                || contains(runbook.getServiceName(), normalized)
                                || runbook.getTriggerKeywords().stream().anyMatch(item -> contains(item, normalized)))
                .toList();
    }

    public List<Runbook> findRelatedRunbooks(List<String> keywords) {
        return runbookRepository.findAll()
                .stream()
                .filter(runbook -> runbook.getTriggerKeywords()
                        .stream()
                        .anyMatch(trigger -> keywords.stream().anyMatch(keyword -> sameKeyword(trigger, keyword))))
                .toList();
    }

    public List<SearchDtos.SimilarIncidentResponse> findSimilarIncidents(Incident incident, int limit) {
        return incidentRepository.findAll()
                .stream()
                .filter(candidate -> !candidate.getId().equals(incident.getId()))
                .map(candidate -> toSimilarIncident(incident, candidate))
                .filter(response -> response.score() > 0
                        || incident.getSimilarIncidentIds().contains(response.incidentId()))
                .sorted(Comparator.comparingInt(SearchDtos.SimilarIncidentResponse::score).reversed())
                .limit(limit)
                .toList();
    }

    private SearchDtos.SimilarIncidentResponse toSimilarIncident(Incident source, Incident candidate) {
        List<String> matchedKeywords = candidate.getKeywords()
                .stream()
                .filter(keyword -> source.getKeywords().stream().anyMatch(sourceKeyword -> sameKeyword(sourceKeyword, keyword)))
                .toList();
        int score = matchedKeywords.size() * 25;

        if (source.getServiceName().equalsIgnoreCase(candidate.getServiceName())) {
            score += 20;
        }

        if (source.getSimilarIncidentIds().contains(candidate.getId())) {
            score = Math.max(score, 88);
        }

        return new SearchDtos.SimilarIncidentResponse(
                candidate.getId(),
                candidate.getTitle(),
                candidate.getServiceName(),
                candidate.getStatus(),
                matchedKeywords,
                Math.min(score, 95)
        );
    }

    private boolean sameKeyword(String left, String right) {
        return normalize(left).equals(normalize(right));
    }

    private boolean contains(String text, String keyword) {
        return text != null && normalize(text).contains(keyword);
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).trim();
    }
}
