package com.opspilot.service;

import com.opspilot.dto.RunbookDtos;
import com.opspilot.entity.Runbook;
import com.opspilot.exception.NotFoundException;
import com.opspilot.repository.RunbookRepository;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class RunbookService {
    private final RunbookRepository runbookRepository;

    @Transactional(readOnly = true)
    public List<RunbookDtos.RunbookResponse> findAll() {
        return runbookRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RunbookDtos.RunbookResponse get(Long id) {
        return toResponse(findEntity(id));
    }

    public RunbookDtos.RunbookResponse create(RunbookDtos.RunbookRequest request) {
        Runbook runbook = Runbook.builder()
                .title(request.title())
                .serviceName(request.serviceName())
                .category(request.category())
                .owner(request.owner())
                .triggerKeywords(request.triggerKeywords())
                .steps(request.steps())
                .build();
        return toResponse(runbookRepository.save(runbook));
    }

    public RunbookDtos.RunbookResponse update(Long id, RunbookDtos.RunbookRequest request) {
        Runbook runbook = findEntity(id);
        runbook.update(
                request.title(),
                request.serviceName(),
                request.category(),
                request.owner(),
                request.triggerKeywords(),
                request.steps()
        );
        return toResponse(runbook);
    }

    public void delete(Long id) {
        runbookRepository.delete(findEntity(id));
    }

    Runbook findEntity(Long id) {
        return runbookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Runbook not found: " + id));
    }

    public RunbookDtos.RunbookResponse toResponse(Runbook runbook) {
        return RunbookDtos.RunbookResponse.builder()
                .id(runbook.getId())
                .title(runbook.getTitle())
                .serviceName(runbook.getServiceName())
                .category(runbook.getCategory())
                .owner(runbook.getOwner())
                .updatedAt(runbook.getUpdatedAt())
                .triggerKeywords(runbook.getTriggerKeywords())
                .steps(runbook.getSteps())
                .linkedIncidentIds(runbook.getLinkedIncidentIds())
                .build();
    }
}
