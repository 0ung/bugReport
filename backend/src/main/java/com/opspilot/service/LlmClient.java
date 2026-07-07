package com.opspilot.service;

import com.opspilot.dto.AiAnalysisRequest;

public interface LlmClient {
    String analyzeIncident(AiAnalysisRequest request);
}
