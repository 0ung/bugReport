package com.opspilot.domain.resolution;

import com.opspilot.domain.incident.Incident;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "resolution_history")
public class ResolutionHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @Column(nullable = false)
    private String actionSummary;

    @Column(nullable = false)
    private String rootCause;

    @Column(nullable = false)
    private String resolvedBy;

    @Column(nullable = false)
    private LocalDateTime resolvedAt;

    private String preventionNotes;

    protected ResolutionHistory() {
    }

    public ResolutionHistory(
            Incident incident,
            String actionSummary,
            String rootCause,
            String resolvedBy,
            String preventionNotes
    ) {
        this.incident = incident;
        this.actionSummary = actionSummary;
        this.rootCause = rootCause;
        this.resolvedBy = resolvedBy;
        this.preventionNotes = preventionNotes;
        this.resolvedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Incident getIncident() {
        return incident;
    }

    public String getActionSummary() {
        return actionSummary;
    }

    public String getRootCause() {
        return rootCause;
    }

    public String getResolvedBy() {
        return resolvedBy;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public String getPreventionNotes() {
        return preventionNotes;
    }
}
