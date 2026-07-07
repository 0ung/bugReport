package com.opspilot;

import static org.assertj.core.api.Assertions.assertThat;

import com.opspilot.dto.AnalysisDtos;
import com.opspilot.dto.DashboardDtos;
import com.opspilot.service.AnalysisService;
import com.opspilot.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class BackendApplicationTests {
	private final DashboardService dashboardService;
	private final AnalysisService analysisService;

	@Autowired
	BackendApplicationTests(DashboardService dashboardService, AnalysisService analysisService) {
		this.dashboardService = dashboardService;
		this.analysisService = analysisService;
	}

	@Test
	void contextLoads() {
	}

	@Test
	void dashboardReturnsSampleIncidentSummary() {
		DashboardDtos.DashboardResponse response = dashboardService.getDashboard();

		assertThat(response.summary().total()).isGreaterThanOrEqualTo(3);
		assertThat(response.recentIncidents())
				.extracting(incident -> incident.title())
				.contains("Payment API 502 Bad Gateway");
	}

	@Test
	void incidentAnalysisCanBeRequested() {
		AnalysisDtos.AiAnalysisResponse response = analysisService.requestAnalysis(1L);

		assertThat(response.confidenceScore()).isGreaterThan(0);
		assertThat(response.relatedRunbookIds()).isNotEmpty();
	}
}
