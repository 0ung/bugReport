package com.opspilot.global.config;

import com.opspilot.domain.analysis.AiAnalysis;
import com.opspilot.domain.analysis.AiAnalysisRepository;
import com.opspilot.domain.analysis.AiFeedback;
import com.opspilot.domain.analysis.AiFeedbackRepository;
import com.opspilot.domain.analysis.FeedbackRating;
import com.opspilot.domain.incident.Incident;
import com.opspilot.domain.incident.IncidentRepository;
import com.opspilot.domain.incident.IncidentSource;
import com.opspilot.domain.incident.IncidentStatus;
import com.opspilot.domain.incident.Severity;
import com.opspilot.domain.incidentlog.IncidentLog;
import com.opspilot.domain.incidentlog.IncidentLogRepository;
import com.opspilot.domain.incidentlog.LogLevel;
import com.opspilot.domain.resolution.ResolutionHistory;
import com.opspilot.domain.resolution.ResolutionHistoryRepository;
import com.opspilot.domain.runbook.Runbook;
import com.opspilot.domain.runbook.RunbookRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SampleDataLoader {
    @Bean
    CommandLineRunner loadSampleData(
            IncidentRepository incidentRepository,
            IncidentLogRepository incidentLogRepository,
            RunbookRepository runbookRepository,
            AiAnalysisRepository aiAnalysisRepository,
            ResolutionHistoryRepository resolutionHistoryRepository,
            AiFeedbackRepository aiFeedbackRepository
    ) {
        return args -> {
            if (incidentRepository.count() > 0) {
                return;
            }

            Runbook gatewayRunbook = runbookRepository.save(new Runbook(
                    "Nginx 502 Bad Gateway response procedure",
                    "edge-gateway",
                    "Gateway",
                    "platform-oncall",
                    List.of("502", "upstream timeout", "Bad Gateway"),
                    List.of(
                            "Check gateway upstream timeout and error-rate charts.",
                            "Confirm target service health and recent deployment history.",
                            "Compare timeout spikes with downstream API latency."
                    )
            ));
            Runbook providerRunbook = runbookRepository.save(new Runbook(
                    "External provider timeout and retry checklist",
                    "payment-api",
                    "External API",
                    "payment-oncall",
                    List.of("SocketTimeoutException", "Connection reset by peer", "retry"),
                    List.of(
                            "Verify provider status page and synthetic check results.",
                            "Inspect retry queue depth and retry exhaustion count.",
                            "Switch to degraded mode when retry backlog exceeds threshold."
                    )
            ));
            Runbook databaseRunbook = runbookRepository.save(new Runbook(
                    "DB connection pool exhaustion checklist",
                    "order-api",
                    "Database",
                    "order-oncall",
                    List.of("HikariPool", "connection timeout", "pool exhausted"),
                    List.of(
                            "Inspect active connection count and slow query dashboard.",
                            "Check recently deployed code for transaction scope changes.",
                            "Scale read replicas or shed non-critical traffic if saturation persists."
                    )
            ));

            Incident paymentIncident = incidentRepository.save(new Incident(
                    "Payment API 502 Bad Gateway",
                    "payment-api",
                    Severity.HIGH,
                    IncidentSource.ALERT,
                    "payment-oncall",
                    1840,
                    "Checkout requests intermittently fail with 502 responses through the edge gateway.",
                    List.of("502", "upstream timeout", "SocketTimeoutException", "payment")
            ));
            Incident syncIncident = incidentRepository.save(new Incident(
                    "External SaaS connection reset",
                    "sync-worker",
                    Severity.MEDIUM,
                    IncidentSource.ALERT,
                    "platform-oncall",
                    420,
                    "Background sync failed because the external SaaS endpoint reset long-running connections.",
                    List.of("Connection reset by peer", "retry", "external api")
            ));
            Incident orderIncident = incidentRepository.save(new Incident(
                    "DB connection pool exhausted",
                    "order-api",
                    Severity.CRITICAL,
                    IncidentSource.ALERT,
                    "order-oncall",
                    5200,
                    "Order placement latency increased after the API exhausted HikariCP connections.",
                    List.of("HikariPool", "connection timeout", "order")
            ));

            paymentIncident.setRelatedRunbookIds(List.of(gatewayRunbook.getId(), providerRunbook.getId()));
            paymentIncident.setSimilarIncidentIds(List.of(syncIncident.getId()));
            syncIncident.setRelatedRunbookIds(List.of(providerRunbook.getId()));
            syncIncident.setSimilarIncidentIds(List.of(paymentIncident.getId()));
            orderIncident.setRelatedRunbookIds(List.of(databaseRunbook.getId()));
            gatewayRunbook.setLinkedIncidentIds(List.of(paymentIncident.getId()));
            providerRunbook.setLinkedIncidentIds(List.of(paymentIncident.getId(), syncIncident.getId()));
            databaseRunbook.setLinkedIncidentIds(List.of(orderIncident.getId()));
            incidentRepository.saveAll(List.of(paymentIncident, syncIncident, orderIncident));
            runbookRepository.saveAll(List.of(gatewayRunbook, providerRunbook, databaseRunbook));

            incidentLogRepository.save(new IncidentLog(
                    paymentIncident,
                    LogLevel.ERROR,
                    "edge-gateway",
                    "upstream timed out while reading response header from upstream, request=POST /payments/authorize",
                    List.of("502", "upstream timeout")
            ));
            incidentLogRepository.save(new IncidentLog(
                    paymentIncident,
                    LogLevel.ERROR,
                    "payment-api",
                    "java.net.SocketTimeoutException: Read timed out at PaymentGatewayClient.authorize",
                    List.of("SocketTimeoutException", "payment")
            ));
            incidentLogRepository.save(new IncidentLog(
                    syncIncident,
                    LogLevel.WARN,
                    "sync-worker",
                    "ProfileSyncJob retry exhausted: java.net.SocketException: Connection reset by peer",
                    List.of("Connection reset by peer", "retry")
            ));
            incidentLogRepository.save(new IncidentLog(
                    orderIncident,
                    LogLevel.ERROR,
                    "order-api",
                    "HikariPool-1 - Connection is not available, request timed out after 30000ms",
                    List.of("HikariPool", "connection timeout")
            ));

            aiAnalysisRepository.save(new AiAnalysis(
                    paymentIncident,
                    82,
                    "The payment incident is likely caused by downstream provider latency surfacing as gateway 502 responses.",
                    List.of(
                            "External payment provider timeout increased beyond the gateway response window.",
                            "Payment API retry behavior may amplify upstream latency."
                    ),
                    List.of(
                            "Compare gateway 502 rate with provider latency.",
                            "Inspect payment-api outbound HTTP timeout settings."
                    ),
                    List.of(
                            "Keep checkout in degraded mode for provider-dependent payment methods.",
                            "Drain retry backlog after provider latency recovers."
                    ),
                    List.of(syncIncident.getId()),
                    List.of(gatewayRunbook.getId(), providerRunbook.getId()),
                    "{\"summary\":\"downstream timeout likely\",\"confidenceScore\":82}"
            ));
            syncIncident.changeStatus(IncidentStatus.MITIGATED);
            resolutionHistoryRepository.save(new ResolutionHistory(
                    syncIncident,
                    "Enabled capped retry and replayed failed profile sync jobs.",
                    "External SaaS provider reset long-running connections during maintenance.",
                    "platform-oncall",
                    "Add provider status polling to the sync-worker incident checklist."
            ));
            aiFeedbackRepository.save(new AiFeedback(
                    syncIncident,
                    FeedbackRating.HELPFUL,
                    "The retry queue check was the fastest clue."
            ));
        };
    }
}
