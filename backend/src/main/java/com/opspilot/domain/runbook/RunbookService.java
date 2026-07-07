package com.opspilot.domain.runbook;

import com.opspilot.global.error.NotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RunbookService {
    private final RunbookRepository runbookRepository;

    public RunbookService(RunbookRepository runbookRepository) {
        this.runbookRepository = runbookRepository;
    }

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
        Runbook runbook = new Runbook(
                request.title(),
                request.serviceName(),
                request.category(),
                request.owner(),
                request.triggerKeywords(),
                request.steps()
        );
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
        return new RunbookDtos.RunbookResponse(
                runbook.getId(),
                runbook.getTitle(),
                runbook.getServiceName(),
                runbook.getCategory(),
                runbook.getOwner(),
                runbook.getUpdatedAt(),
                runbook.getTriggerKeywords(),
                runbook.getSteps(),
                runbook.getLinkedIncidentIds()
        );
    }
}
