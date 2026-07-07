package com.opspilot.infra.llm;

public interface LlmClient {
    String analyzeIncident(AiAnalysisRequest request);
}
