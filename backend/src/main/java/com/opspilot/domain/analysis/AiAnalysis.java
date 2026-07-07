package com.opspilot.domain.analysis;

import com.opspilot.domain.incident.Incident;
import com.opspilot.global.util.TextList;
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
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "ai_analyses")
public class AiAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private int confidenceScore;

    @Column(nullable = false)
    private String summary;

    private String suspectedCauses;
    private String checkSteps;
    private String recommendedActions;
    private String relatedIncidentIds;
    private String relatedRunbookIds;

    @Column(nullable = false)
    private String rawResponse;

    protected AiAnalysis() {
    }

    public AiAnalysis(
            Incident incident,
            int confidenceScore,
            String summary,
            Collection<String> suspectedCauses,
            Collection<String> checkSteps,
            Collection<String> recommendedActions,
            Collection<Long> relatedIncidentIds,
            Collection<Long> relatedRunbookIds,
            String rawResponse
    ) {
        this.incident = incident;
        this.createdAt = LocalDateTime.now();
        this.confidenceScore = confidenceScore;
        this.summary = summary;
        this.suspectedCauses = TextList.encode(suspectedCauses);
        this.checkSteps = TextList.encode(checkSteps);
        this.recommendedActions = TextList.encode(recommendedActions);
        this.relatedIncidentIds = TextList.encodeLongs(relatedIncidentIds);
        this.relatedRunbookIds = TextList.encodeLongs(relatedRunbookIds);
        this.rawResponse = rawResponse;
    }

    public Long getId() {
        return id;
    }

    public Incident getIncident() {
        return incident;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public int getConfidenceScore() {
        return confidenceScore;
    }

    public String getSummary() {
        return summary;
    }

    public List<String> getSuspectedCauses() {
        return TextList.decode(suspectedCauses);
    }

    public List<String> getCheckSteps() {
        return TextList.decode(checkSteps);
    }

    public List<String> getRecommendedActions() {
        return TextList.decode(recommendedActions);
    }

    public List<Long> getRelatedIncidentIds() {
        return TextList.decodeLongs(relatedIncidentIds);
    }

    public List<Long> getRelatedRunbookIds() {
        return TextList.decodeLongs(relatedRunbookIds);
    }

    public String getRawResponse() {
        return rawResponse;
    }
}
