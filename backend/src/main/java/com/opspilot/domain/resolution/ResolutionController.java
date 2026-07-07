package com.opspilot.domain.resolution;

import com.opspilot.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/incidents/{incidentId}/resolution")
@RequiredArgsConstructor
public class ResolutionController {
    private final ResolutionService resolutionService;

    @PostMapping
    public ApiResponse<ResolutionDtos.ResolutionResponse> create(
            @PathVariable Long incidentId,
            @Valid @RequestBody ResolutionDtos.CreateResolutionRequest request
    ) {
        return ApiResponse.success(resolutionService.create(incidentId, request));
    }

    @GetMapping
    public ApiResponse<ResolutionDtos.ResolutionResponse> getLatest(@PathVariable Long incidentId) {
        return ApiResponse.success(resolutionService.getLatest(incidentId));
    }
}
