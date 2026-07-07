package com.opspilot.domain.runbook;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RunbookRepository extends JpaRepository<Runbook, Long> {
    List<Runbook> findByServiceNameContainingIgnoreCaseOrTitleContainingIgnoreCase(
            String serviceName,
            String title
    );
}
