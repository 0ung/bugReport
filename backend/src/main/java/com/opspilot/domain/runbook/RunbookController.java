package com.opspilot.domain.runbook;

import com.opspilot.global.response.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/runbooks")
public class RunbookController {
    private final RunbookService runbookService;

    public RunbookController(RunbookService runbookService) {
        this.runbookService = runbookService;
    }

    @GetMapping
    public ApiResponse<List<RunbookDtos.RunbookResponse>> findAll() {
        return ApiResponse.success(runbookService.findAll());
    }

    @PostMapping
    public ApiResponse<RunbookDtos.RunbookResponse> create(
            @Valid @RequestBody RunbookDtos.RunbookRequest request
    ) {
        return ApiResponse.success(runbookService.create(request));
    }

    @GetMapping("/{runbookId}")
    public ApiResponse<RunbookDtos.RunbookResponse> get(@PathVariable Long runbookId) {
        return ApiResponse.success(runbookService.get(runbookId));
    }

    @PutMapping("/{runbookId}")
    public ApiResponse<RunbookDtos.RunbookResponse> update(
            @PathVariable Long runbookId,
            @Valid @RequestBody RunbookDtos.RunbookRequest request
    ) {
        return ApiResponse.success(runbookService.update(runbookId, request));
    }

    @DeleteMapping("/{runbookId}")
    public ApiResponse<Void> delete(@PathVariable Long runbookId) {
        runbookService.delete(runbookId);
        return ApiResponse.empty();
    }
}
