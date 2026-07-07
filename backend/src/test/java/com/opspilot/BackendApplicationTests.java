package com.opspilot;

import static org.assertj.core.api.Assertions.assertThat;

import com.opspilot.dto.AnalysisDtos;
import com.opspilot.dto.DashboardDtos;
import com.opspilot.dto.IncidentDtos;
import com.opspilot.dto.RunbookDtos;
import com.opspilot.entity.IncidentSource;
import com.opspilot.entity.Severity;
import com.opspilot.service.AnalysisService;
import com.opspilot.service.DashboardService;
import com.opspilot.service.IncidentService;
import com.opspilot.service.RunbookService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class BackendApplicationTests {
    private final DashboardService dashboardService;
    private final AnalysisService analysisService;
    private final IncidentService incidentService;
    private final RunbookService runbookService;

    @Autowired
    BackendApplicationTests(
            DashboardService dashboardService,
            AnalysisService analysisService,
            IncidentService incidentService,
            RunbookService runbookService
    ) {
        this.dashboardService = dashboardService;
        this.analysisService = analysisService;
        this.incidentService = incidentService;
        this.runbookService = runbookService;
    }

    @Test
    void contextLoads() {
    }

    @Test
    void dashboardStartsWithoutSeedData() {
        DashboardDtos.DashboardResponse response = dashboardService.getDashboard();

        assertThat(response.summary().total()).isZero();
        assertThat(response.recentIncidents()).isEmpty();
        assertThat(response.topKeywords()).isEmpty();
    }

    @Test
    void incidentAnalysisCanBeRequestedWithUserCreatedData() {
        RunbookDtos.RunbookResponse runbook = runbookService.create(RunbookDtos.RunbookRequest.builder()
                .title("Connection reset response checklist")
                .serviceName("test-service")
                .category("Network")
                .owner("test-owner")
                .triggerKeywords(List.of("connection reset by peer", "retry"))
                .steps(List.of("Check retry rate.", "Verify upstream connection reset count."))
                .build());
        IncidentDtos.IncidentDetailResponse incident = incidentService.create(
                IncidentDtos.CreateIncidentRequest.builder()
                        .title("Test connection reset")
                        .serviceName("test-service")
                        .severity(Severity.MEDIUM)
                        .source(IncidentSource.MANUAL)
                        .owner("test-owner")
                        .affectedUsers(12)
                        .description("Test service returns intermittent connection reset errors.")
                        .rawLog("java.net.SocketException: Connection reset by peer during retry")
                        .build()
        );

        AnalysisDtos.AiAnalysisResponse response = analysisService.requestAnalysis(incident.id());

        assertThat(response.confidenceScore()).isGreaterThan(0);
        assertThat(response.relatedRunbookIds()).contains(runbook.id());
    }
}
