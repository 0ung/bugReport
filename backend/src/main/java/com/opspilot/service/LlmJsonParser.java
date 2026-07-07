package com.opspilot.service;

import com.opspilot.dto.AiAnalysisResponse;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LlmJsonParser {
    private final ObjectMapper objectMapper;

    public AiAnalysisResponse parse(String rawResponse) {
        try {
            return objectMapper.readValue(rawResponse, AiAnalysisResponse.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("AI response is not valid JSON", exception);
        }
    }
}
