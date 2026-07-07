package com.opspilot.response;

import java.time.Instant;

public record ApiResponse<T>(
        boolean success,
        T data,
        String message,
        Instant timestamp
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, "OK", Instant.now());
    }

    public static ApiResponse<Void> empty() {
        return new ApiResponse<>(true, null, "OK", Instant.now());
    }

    public static ApiResponse<Void> failure(String message) {
        return new ApiResponse<>(false, null, message, Instant.now());
    }
}
