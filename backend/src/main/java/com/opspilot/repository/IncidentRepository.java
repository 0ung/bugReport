package com.opspilot.repository;

import com.opspilot.entity.Incident;
import com.opspilot.entity.IncidentStatus;
import com.opspilot.entity.Severity;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findTop5ByOrderByUpdatedAtDesc();

    long countByStatusIn(Collection<IncidentStatus> statuses);

    long countBySeverityIn(Collection<Severity> severities);
}
