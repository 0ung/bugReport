package com.opspilot.domain.resolution;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResolutionHistoryRepository extends JpaRepository<ResolutionHistory, Long> {
    Optional<ResolutionHistory> findTopByIncidentIdOrderByResolvedAtDesc(Long incidentId);
}
