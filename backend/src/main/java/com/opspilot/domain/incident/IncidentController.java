package com.opspilot.domain.incident;

import com.opspilot.domain.incidentlog.IncidentLogDtos;
import com.opspilot.domain.incidentlog.IncidentLogService;
import com.opspilot.global.response.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {
    private final IncidentService incidentService;
    private final IncidentLogService incidentLogService;

    public IncidentController(IncidentService incidentService, IncidentLogService incidentLogService) {
        this.incidentService = incidentService;
        this.incidentLogService = incidentLogService;
    }

    @GetMapping
    public ApiResponse<List<IncidentDtos.IncidentResponse>> findAll() {
        return ApiResponse.success(incidentService.findAll());
    }

    @PostMapping
    public ApiResponse<IncidentDtos.IncidentDetailResponse> create(
            @Valid @RequestBody IncidentDtos.CreateIncidentRequest request
    ) {
        return ApiResponse.success(incidentService.create(request));
    }

    @GetMapping("/{incidentId}")
    public ApiResponse<IncidentDtos.IncidentDetailResponse> get(@PathVariable Long incidentId) {
        return ApiResponse.success(incidentService.getDetail(incidentId));
    }

    @PatchMapping("/{incidentId}/status")
    public ApiResponse<IncidentDtos.IncidentResponse> changeStatus(
            @PathVariable Long incidentId,
            @Valid @RequestBody IncidentDtos.ChangeIncidentStatusRequest request
    ) {
        return ApiResponse.success(incidentService.changeStatus(incidentId, request));
    }

    @GetMapping("/{incidentId}/logs")
    public ApiResponse<List<IncidentLogDtos.IncidentLogResponse>> findLogs(@PathVariable Long incidentId) {
        return ApiResponse.success(incidentLogService.findByIncidentId(incidentId));
    }

    @PostMapping("/{incidentId}/logs")
    public ApiResponse<IncidentLogDtos.IncidentLogResponse> createLog(
            @PathVariable Long incidentId,
            @Valid @RequestBody IncidentLogDtos.CreateIncidentLogRequest request
    ) {
        return ApiResponse.success(incidentLogService.create(incidentId, request));
    }
}
