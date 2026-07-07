package com.opspilot.controller;

import com.opspilot.dto.AiAnalysisResponse;
import com.opspilot.dto.AnalysisDtos;
import com.opspilot.response.ApiResponse;
import com.opspilot.service.AnalysisService;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalysisController {
    private final AnalysisService analysisService;

    @GetMapping("/analysis")
    public ApiResponse<List<AnalysisDtos.AiAnalysisResponse>> findAll() {
        return ApiResponse.success(analysisService.findAll());
    }

    @PostMapping("/incidents/{incidentId}/analysis")
    public ApiResponse<AnalysisDtos.AiAnalysisResponse> requestAnalysis(@PathVariable Long incidentId) {
        return ApiResponse.success(analysisService.requestAnalysis(incidentId));
    }

    @GetMapping("/incidents/{incidentId}/analysis")
    public ApiResponse<AnalysisDtos.AiAnalysisResponse> getLatestAnalysis(@PathVariable Long incidentId) {
        return ApiResponse.success(analysisService.getLatest(incidentId));
    }

    @PostMapping("/incidents/{incidentId}/feedback")
    public ApiResponse<AnalysisDtos.AiFeedbackResponse> createFeedback(
            @PathVariable Long incidentId,
            @Valid @RequestBody AnalysisDtos.CreateFeedbackRequest request
    ) {
        return ApiResponse.success(analysisService.createFeedback(incidentId, request));
    }
}
