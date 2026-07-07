package com.opspilot.domain.runbook;

import com.opspilot.global.util.TextList;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "runbooks")
public class Runbook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String serviceName;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String owner;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private String triggerKeywords;
    private String steps;
    private String linkedIncidentIds;

    protected Runbook() {
    }

    public Runbook(
            String title,
            String serviceName,
            String category,
            String owner,
            Collection<String> triggerKeywords,
            Collection<String> steps
    ) {
        this.title = title;
        this.serviceName = serviceName;
        this.category = category;
        this.owner = owner;
        this.updatedAt = LocalDateTime.now();
        this.triggerKeywords = TextList.encode(triggerKeywords);
        this.steps = TextList.encode(steps);
        this.linkedIncidentIds = "";
    }

    public void update(
            String title,
            String serviceName,
            String category,
            String owner,
            Collection<String> triggerKeywords,
            Collection<String> steps
    ) {
        this.title = title;
        this.serviceName = serviceName;
        this.category = category;
        this.owner = owner;
        this.triggerKeywords = TextList.encode(triggerKeywords);
        this.steps = TextList.encode(steps);
        this.updatedAt = LocalDateTime.now();
    }

    public void setLinkedIncidentIds(Collection<Long> ids) {
        this.linkedIncidentIds = TextList.encodeLongs(ids);
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

    public String getCategory() {
        return category;
    }

    public String getOwner() {
        return owner;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<String> getTriggerKeywords() {
        return TextList.decode(triggerKeywords);
    }

    public List<String> getSteps() {
        return TextList.decode(steps);
    }

    public List<Long> getLinkedIncidentIds() {
        return TextList.decodeLongs(linkedIncidentIds);
    }
}
