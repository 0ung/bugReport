package com.opspilot.domain.analysis;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiFeedbackRepository extends JpaRepository<AiFeedback, Long> {
    Optional<AiFeedback> findTopByIncidentIdOrderByCreatedAtDesc(Long incidentId);
}
