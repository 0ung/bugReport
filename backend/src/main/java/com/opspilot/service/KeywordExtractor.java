package com.opspilot.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Component;

@Component
public class KeywordExtractor {
    private static final List<String> KNOWN_ERROR_TERMS = List.of(
            "502",
            "401",
            "upstream timeout",
            "sockettimeoutexception",
            "connection reset by peer",
            "hikaripool",
            "connection timeout",
            "retry",
            "jwt",
            "signing key",
            "batch delayed",
            "external api",
            "latency",
            "payment",
            "order"
    );

    public List<String> extract(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        String normalized = text.toLowerCase(Locale.ROOT);
        List<String> matches = new ArrayList<>();

        for (String term : KNOWN_ERROR_TERMS) {
            if (normalized.contains(term)) {
                matches.add(displayTerm(term));
            }
        }

        if (!matches.isEmpty()) {
            return matches;
        }

        return Arrays.stream(text.split("\\W+"))
                .map(String::trim)
                .filter(item -> item.length() >= 4)
                .distinct()
                .limit(5)
                .toList();
    }

    private String displayTerm(String term) {
        return switch (term) {
            case "sockettimeoutexception" -> "SocketTimeoutException";
            case "hikaripool" -> "HikariPool";
            case "jwt" -> "JWT";
            default -> term;
        };
    }
}
