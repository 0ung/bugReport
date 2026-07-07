package com.opspilot.global.util;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

public final class TextList {
    private TextList() {
    }

    public static String encode(Collection<String> values) {
        if (values == null) {
            return "";
        }

        return values.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .reduce((left, right) -> left + "\n" + right)
                .orElse("");
    }

    public static List<String> decode(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }

        return Arrays.stream(value.split("\\R"))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .distinct()
                .toList();
    }

    public static String encodeLongs(Collection<Long> values) {
        if (values == null) {
            return "";
        }

        return values.stream()
                .filter(Objects::nonNull)
                .map(String::valueOf)
                .reduce((left, right) -> left + "\n" + right)
                .orElse("");
    }

    public static List<Long> decodeLongs(String value) {
        return decode(value).stream()
                .map(Long::valueOf)
                .toList();
    }
}
