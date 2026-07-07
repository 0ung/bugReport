package com.opspilot.repository;

import com.opspilot.entity.AiAnalysis;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, Long> {
    Optional<AiAnalysis> findTopByIncidentIdOrderByCreatedAtDesc(Long incidentId);

    List<AiAnalysis> findByIncidentIdOrderByCreatedAtDesc(Long incidentId);
}
