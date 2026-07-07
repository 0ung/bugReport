package com.opspilot.entity;

import com.opspilot.util.TextList;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "incident_logs")
public class IncidentLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LogLevel level;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private LocalDateTime capturedAt;

    private String extractedKeywords;

    @Builder
    private IncidentLog(
            Incident incident,
            LogLevel level,
            String source,
            String message,
            Collection<String> extractedKeywords
    ) {
        this.incident = incident;
        this.level = level;
        this.source = source;
        this.message = message;
        this.capturedAt = LocalDateTime.now();
        this.extractedKeywords = TextList.encode(extractedKeywords);
    }

    public List<String> getExtractedKeywords() {
        return TextList.decode(extractedKeywords);
    }
}
