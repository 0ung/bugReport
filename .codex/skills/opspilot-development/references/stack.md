# OpsPilot Stack Reference

This stack is adapted from skills.sh topic guidance:

- React: https://www.skills.sh/topic/react
- Next.js: https://www.skills.sh/topic/nextjs
- Databases: https://www.skills.sh/topic/databases
- Testing: https://www.skills.sh/topic/testing

## Frontend

Use React for the MVP. The UI is an internal operations tool with incident tables, forms, filters, analysis panels, and workflow state.

Use:

- React for component composition.
- TypeScript for DTO contracts and safer UI state.
- Vite for a simple standalone SPA setup.
- React Router for dashboard, incident, runbook, and analysis routes.
- TanStack Query for server state, cache invalidation, loading states, and mutations.
- Tailwind CSS and shadcn/ui for tables, forms, dialogs, tabs, badges, and layout primitives.
- React Testing Library for component behavior.
- Playwright for end-to-end flows.

Keep Next.js as a later option only if the project needs App Router conventions, SSR, route handlers, or Vercel-specific deployment behavior.

## Backend

Use Spring Boot as the API backend.

Use:

- Java 17 as the runtime.
- Spring Web for REST APIs.
- Spring Data JPA for domain persistence.
- Bean Validation for request DTO validation.
- PostgreSQL for incidents, logs, runbooks, analysis results, feedback, and resolution history.
- Flyway for schema migrations.
- PostgreSQL full-text search for MVP search.
- pgvector later for embedding-based Runbook and incident retrieval.
- JUnit 5 and Mockito for unit tests.
- Testcontainers for PostgreSQL integration tests.

Avoid adding Kafka, Kubernetes, Prometheus, Slack alerts, or automated remediation in the first MVP.

## Portfolio Framing

Explain the stack as a deliberate operations-system choice:

- React + TanStack Query handles server-heavy workflow screens.
- Spring Boot keeps API, validation, transactions, and testing conventional.
- PostgreSQL stores operational history and supports search before vector retrieval is needed.
- Flyway makes schema evolution visible.
- Testcontainers and Playwright prove the incident response flow works end to end.
