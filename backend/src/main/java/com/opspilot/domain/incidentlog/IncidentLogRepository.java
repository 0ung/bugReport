package com.opspilot.domain.incidentlog;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentLogRepository extends JpaRepository<IncidentLog, Long> {
    List<IncidentLog> findByIncidentIdOrderByCapturedAtAsc(Long incidentId);
}
