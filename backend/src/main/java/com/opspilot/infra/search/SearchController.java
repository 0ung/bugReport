package com.opspilot.infra.search;

import com.opspilot.domain.incident.Incident;
import com.opspilot.domain.incident.IncidentDtos;
import com.opspilot.domain.runbook.Runbook;
import com.opspilot.domain.runbook.RunbookService;
import com.opspilot.global.response.ApiResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    private final SearchService searchService;
    private final RunbookService runbookService;

    public SearchController(SearchService searchService, RunbookService runbookService) {
        this.searchService = searchService;
        this.runbookService = runbookService;
    }

    @GetMapping("/incidents")
    public ApiResponse<List<IncidentDtos.IncidentResponse>> searchIncidents(@RequestParam String keyword) {
        return ApiResponse.success(searchService.searchIncidents(keyword)
                .stream()
                .map(this::toIncidentResponse)
                .toList());
    }

    @GetMapping("/runbooks")
    public ApiResponse<List<com.opspilot.domain.runbook.RunbookDtos.RunbookResponse>> searchRunbooks(
            @RequestParam String keyword
    ) {
        return ApiResponse.success(searchService.searchRunbooks(keyword)
                .stream()
                .map(runbookService::toResponse)
                .toList());
    }

    private IncidentDtos.IncidentResponse toIncidentResponse(Incident incident) {
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
}
