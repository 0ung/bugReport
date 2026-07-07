package com.opspilot.domain.dashboard;

import com.opspilot.domain.incident.IncidentDtos;
import com.opspilot.global.response.ApiResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ApiResponse<DashboardDtos.DashboardResponse> getDashboard() {
        return ApiResponse.success(dashboardService.getDashboard());
    }

    @GetMapping("/summary")
    public ApiResponse<DashboardDtos.IncidentSummaryResponse> getSummary() {
        return ApiResponse.success(dashboardService.getSummary());
    }

    @GetMapping("/severity-stats")
    public ApiResponse<List<DashboardDtos.SeverityStatResponse>> getSeverityStats() {
        return ApiResponse.success(dashboardService.getSeverityStats());
    }

    @GetMapping("/top-keywords")
    public ApiResponse<List<DashboardDtos.KeywordStatResponse>> getTopKeywords() {
        return ApiResponse.success(dashboardService.getTopKeywords());
    }

    @GetMapping("/recent-incidents")
    public ApiResponse<List<IncidentDtos.IncidentResponse>> getRecentIncidents() {
        return ApiResponse.success(dashboardService.getRecentIncidents());
    }
}
