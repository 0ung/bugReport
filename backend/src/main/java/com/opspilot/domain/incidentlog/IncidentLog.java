package com.opspilot.domain.incidentlog;

import com.opspilot.domain.incident.Incident;
import com.opspilot.global.util.TextList;
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

    protected IncidentLog() {
    }

    public IncidentLog(
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

    public Long getId() {
        return id;
    }

    public Incident getIncident() {
        return incident;
    }

    public LogLevel getLevel() {
        return level;
    }

    public String getSource() {
        return source;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getCapturedAt() {
        return capturedAt;
    }

    public List<String> getExtractedKeywords() {
        return TextList.decode(extractedKeywords);
    }
}
