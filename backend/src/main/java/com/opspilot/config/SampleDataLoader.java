package com.opspilot.config;

import com.opspilot.entity.AiAnalysis;
import com.opspilot.entity.AiFeedback;
import com.opspilot.entity.FeedbackRating;
import com.opspilot.entity.Incident;
import com.opspilot.entity.IncidentLog;
import com.opspilot.entity.IncidentSource;
import com.opspilot.entity.IncidentStatus;
import com.opspilot.entity.LogLevel;
import com.opspilot.entity.ResolutionHistory;
import com.opspilot.entity.Runbook;
import com.opspilot.entity.Severity;
import com.opspilot.repository.AiAnalysisRepository;
import com.opspilot.repository.AiFeedbackRepository;
import com.opspilot.repository.IncidentLogRepository;
import com.opspilot.repository.IncidentRepository;
import com.opspilot.repository.ResolutionHistoryRepository;
import com.opspilot.repository.RunbookRepository;

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

            Runbook gatewayRunbook = runbookRepository.save(Runbook.builder()
                    .title("Nginx 502 Bad Gateway response procedure")
                    .serviceName("edge-gateway")
                    .category("Gateway")
                    .owner("platform-oncall")
                    .triggerKeywords(List.of("502", "upstream timeout", "Bad Gateway"))
                    .steps(List.of(
                            "Check gateway upstream timeout and error-rate charts.",
                            "Confirm target service health and recent deployment history.",
                            "Compare timeout spikes with downstream API latency."
                    ))
                    .build());
            Runbook providerRunbook = runbookRepository.save(Runbook.builder()
                    .title("External provider timeout and retry checklist")
                    .serviceName("payment-api")
                    .category("External API")
                    .owner("payment-oncall")
                    .triggerKeywords(List.of("SocketTimeoutException", "Connection reset by peer", "retry"))
                    .steps(List.of(
                            "Verify provider status page and synthetic check results.",
                            "Inspect retry queue depth and retry exhaustion count.",
                            "Switch to degraded mode when retry backlog exceeds threshold."
                    ))
                    .build());
            Runbook databaseRunbook = runbookRepository.save(Runbook.builder()
                    .title("DB connection pool exhaustion checklist")
                    .serviceName("order-api")
                    .category("Database")
                    .owner("order-oncall")
                    .triggerKeywords(List.of("HikariPool", "connection timeout", "pool exhausted"))
                    .steps(List.of(
                            "Inspect active connection count and slow query dashboard.",
                            "Check recently deployed code for transaction scope changes.",
                            "Scale read replicas or shed non-critical traffic if saturation persists."
                    ))
                    .build());

            Incident paymentIncident = incidentRepository.save(Incident.builder()
                    .title("Payment API 502 Bad Gateway")
                    .serviceName("payment-api")
                    .severity(Severity.HIGH)
                    .source(IncidentSource.ALERT)
                    .owner("payment-oncall")
                    .affectedUsers(1840)
                    .description("Checkout requests intermittently fail with 502 responses through the edge gateway.")
                    .keywords(List.of("502", "upstream timeout", "SocketTimeoutException", "payment"))
                    .build());
            Incident syncIncident = incidentRepository.save(Incident.builder()
                    .title("External SaaS connection reset")
                    .serviceName("sync-worker")
                    .severity(Severity.MEDIUM)
                    .source(IncidentSource.ALERT)
                    .owner("platform-oncall")
                    .affectedUsers(420)
                    .description("Background sync failed because the external SaaS endpoint reset long-running connections.")
                    .keywords(List.of("Connection reset by peer", "retry", "external api"))
                    .build());
            Incident orderIncident = incidentRepository.save(Incident.builder()
                    .title("DB connection pool exhausted")
                    .serviceName("order-api")
                    .severity(Severity.CRITICAL)
                    .source(IncidentSource.ALERT)
                    .owner("order-oncall")
                    .affectedUsers(5200)
                    .description("Order placement latency increased after the API exhausted HikariCP connections.")
                    .keywords(List.of("HikariPool", "connection timeout", "order"))
                    .build());

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

            incidentLogRepository.save(IncidentLog.builder()
                    .incident(paymentIncident)
                    .level(LogLevel.ERROR)
                    .source("edge-gateway")
                    .message("upstream timed out while reading response header from upstream, request=POST /payments/authorize")
                    .extractedKeywords(List.of("502", "upstream timeout"))
                    .build());
            incidentLogRepository.save(IncidentLog.builder()
                    .incident(paymentIncident)
                    .level(LogLevel.ERROR)
                    .source("payment-api")
                    .message("java.net.SocketTimeoutException: Read timed out at PaymentGatewayClient.authorize")
                    .extractedKeywords(List.of("SocketTimeoutException", "payment"))
                    .build());
            incidentLogRepository.save(IncidentLog.builder()
                    .incident(syncIncident)
                    .level(LogLevel.WARN)
                    .source("sync-worker")
                    .message("ProfileSyncJob retry exhausted: java.net.SocketException: Connection reset by peer")
                    .extractedKeywords(List.of("Connection reset by peer", "retry"))
                    .build());
            incidentLogRepository.save(IncidentLog.builder()
                    .incident(orderIncident)
                    .level(LogLevel.ERROR)
                    .source("order-api")
                    .message("HikariPool-1 - Connection is not available, request timed out after 30000ms")
                    .extractedKeywords(List.of("HikariPool", "connection timeout"))
                    .build());

            aiAnalysisRepository.save(AiAnalysis.builder()
                    .incident(paymentIncident)
                    .confidenceScore(82)
                    .summary("The payment incident is likely caused by downstream provider latency surfacing as gateway 502 responses.")
                    .suspectedCauses(List.of(
                            "External payment provider timeout increased beyond the gateway response window.",
                            "Payment API retry behavior may amplify upstream latency."
                    ))
                    .checkSteps(List.of(
                            "Compare gateway 502 rate with provider latency.",
                            "Inspect payment-api outbound HTTP timeout settings."
                    ))
                    .recommendedActions(List.of(
                            "Keep checkout in degraded mode for provider-dependent payment methods.",
                            "Drain retry backlog after provider latency recovers."
                    ))
                    .relatedIncidentIds(List.of(syncIncident.getId()))
                    .relatedRunbookIds(List.of(gatewayRunbook.getId(), providerRunbook.getId()))
                    .rawResponse("{\"summary\":\"downstream timeout likely\",\"confidenceScore\":82}")
                    .build());
            syncIncident.changeStatus(IncidentStatus.MITIGATED);
            resolutionHistoryRepository.save(ResolutionHistory.builder()
                    .incident(syncIncident)
                    .actionSummary("Enabled capped retry and replayed failed profile sync jobs.")
                    .rootCause("External SaaS provider reset long-running connections during maintenance.")
                    .resolvedBy("platform-oncall")
                    .preventionNotes("Add provider status polling to the sync-worker incident checklist.")
                    .build());
            aiFeedbackRepository.save(AiFeedback.builder()
                    .incident(syncIncident)
                    .rating(FeedbackRating.HELPFUL)
                    .note("The retry queue check was the fastest clue.")
                    .build());
        };
    }
}
