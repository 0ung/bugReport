package com.opspilot.repository;

import com.opspilot.entity.AiFeedback;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiFeedbackRepository extends JpaRepository<AiFeedback, Long> {
    Optional<AiFeedback> findTopByIncidentIdOrderByCreatedAtDesc(Long incidentId);
}
