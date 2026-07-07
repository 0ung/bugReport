package com.opspilot.repository;

import com.opspilot.entity.Runbook;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RunbookRepository extends JpaRepository<Runbook, Long> {
    List<Runbook> findByServiceNameContainingIgnoreCaseOrTitleContainingIgnoreCase(
            String serviceName,
            String title
    );
}
