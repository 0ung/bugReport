package com.opspilot.infra.llm;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class LlmJsonParser {
    private final ObjectMapper objectMapper;

    public LlmJsonParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public AiAnalysisResponse parse(String rawResponse) {
        try {
            return objectMapper.readValue(rawResponse, AiAnalysisResponse.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("AI response is not valid JSON", exception);
        }
    }
}
