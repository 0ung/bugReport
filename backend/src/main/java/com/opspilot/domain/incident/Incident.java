package com.opspilot.domain.incident;

import com.opspilot.global.util.TextList;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "incidents")
public class Incident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String serviceName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentSource source;

    @Column(nullable = false)
    private String owner;

    @Column(nullable = false)
    private int affectedUsers;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDateTime occurredAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private String keywords;
    private String relatedRunbookIds;
    private String similarIncidentIds;

    protected Incident() {
    }

    public Incident(
            String title,
            String serviceName,
            Severity severity,
            IncidentSource source,
            String owner,
            int affectedUsers,
            String description,
            Collection<String> keywords
    ) {
        this.title = title;
        this.serviceName = serviceName;
        this.severity = severity;
        this.status = IncidentStatus.OPEN;
        this.source = source;
        this.owner = owner;
        this.affectedUsers = affectedUsers;
        this.description = description;
        this.occurredAt = LocalDateTime.now();
        this.updatedAt = this.occurredAt;
        setKeywords(keywords);
        setRelatedRunbookIds(List.of());
        setSimilarIncidentIds(List.of());
    }

    public void changeStatus(IncidentStatus status) {
        this.status = status;
        touch();
    }

    public void setRelatedRunbookIds(Collection<Long> ids) {
        this.relatedRunbookIds = TextList.encodeLongs(ids);
    }

    public void setSimilarIncidentIds(Collection<Long> ids) {
        this.similarIncidentIds = TextList.encodeLongs(ids);
    }

    public void setKeywords(Collection<String> keywords) {
        this.keywords = TextList.encode(keywords);
    }

    public void touch() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getServiceName() {
        return serviceName;
    }

    public Severity getSeverity() {
        return severity;
    }

    public IncidentStatus getStatus() {
        return status;
    }

    public IncidentSource getSource() {
        return source;
    }

    public String getOwner() {
        return owner;
    }

    public int getAffectedUsers() {
        return affectedUsers;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<String> getKeywords() {
        return TextList.decode(keywords);
    }

    public List<Long> getRelatedRunbookIds() {
        return TextList.decodeLongs(relatedRunbookIds);
    }

    public List<Long> getSimilarIncidentIds() {
        return TextList.decodeLongs(similarIncidentIds);
    }
}
