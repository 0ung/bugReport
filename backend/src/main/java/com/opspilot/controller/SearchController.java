package com.opspilot.controller;

import com.opspilot.dto.IncidentDtos;
import com.opspilot.dto.RunbookDtos;
import com.opspilot.entity.Incident;
import com.opspilot.response.ApiResponse;
import com.opspilot.service.RunbookService;
import com.opspilot.service.SearchService;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {
    private final SearchService searchService;
    private final RunbookService runbookService;

    @GetMapping("/incidents")
    public ApiResponse<List<IncidentDtos.IncidentResponse>> searchIncidents(@RequestParam String keyword) {
        return ApiResponse.success(searchService.searchIncidents(keyword)
                .stream()
                .map(this::toIncidentResponse)
                .toList());
    }

    @GetMapping("/runbooks")
    public ApiResponse<List<RunbookDtos.RunbookResponse>> searchRunbooks(
            @RequestParam String keyword
    ) {
        return ApiResponse.success(searchService.searchRunbooks(keyword)
                .stream()
                .map(runbookService::toResponse)
                .toList());
    }

    private IncidentDtos.IncidentResponse toIncidentResponse(Incident incident) {
        return IncidentDtos.IncidentResponse.builder()
                .id(incident.getId())
                .title(incident.getTitle())
                .serviceName(incident.getServiceName())
                .severity(incident.getSeverity())
                .status(incident.getStatus())
                .source(incident.getSource())
                .owner(incident.getOwner())
                .affectedUsers(incident.getAffectedUsers())
                .description(incident.getDescription())
                .occurredAt(incident.getOccurredAt())
                .updatedAt(incident.getUpdatedAt())
                .keywords(incident.getKeywords())
                .relatedRunbookIds(incident.getRelatedRunbookIds())
                .similarIncidentIds(incident.getSimilarIncidentIds())
                .build();
    }
}
