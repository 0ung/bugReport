---
name: opspilot-development
description: OpsPilot project development workflow for Codex. Use when working in the 0ung/bugReport repository or Solution1 workspace on GitHub issues, GitFlow branches, React/TypeScript frontend, Spring Boot backend, PostgreSQL/Flyway, incident/runbook/AI-analysis features, tests, documentation, or portfolio polish.
---

# OpsPilot Development

## Core Rule

Treat OpsPilot as an operations incident-response system, not a generic AI chatbot or CRUD demo.

Build around this flow:

```text
Incident -> Logs -> Keyword/Search -> Similar Incidents -> Runbooks -> AI Analysis -> Resolution/Feedback
```

## Before Work

1. Start from `develop` unless the user explicitly asks for `main`, `release/*`, or `hotfix/*`.
2. Use the GitHub issue number in the branch name:
   - `feature/{issue-number}-{short-name}`
   - `fix/{issue-number}-{short-name}`
   - `docs/{issue-number}-{short-name}`
3. Target PRs to `develop`.
4. Update GitHub Project status when starting or finishing issue work.
5. Ignore existing untracked legacy files such as `Solution1.Api/`, `Solution1.sln`, and `CSharp_Basics_01.md` unless the user asks to migrate or commit them.

## Stack Selection

Read `references/stack.md` when choosing dependencies, explaining technology choices, or setting up frontend/backend projects.

Default stack:

- Frontend: React, TypeScript, Vite, React Router, TanStack Query
- UI: Tailwind CSS, shadcn/ui
- Backend: Java 17, Spring Boot, Spring Web, Spring Data JPA, Bean Validation
- Database: PostgreSQL, Flyway
- Search: PostgreSQL full-text search first, `pgvector` later
- Tests: JUnit 5, Mockito, Testcontainers, React Testing Library, Playwright
- Infra: Docker Compose, GitHub Actions

Do not introduce Next.js in the MVP unless the user asks for SSR, App Router, or Vercel-specific deployment. The MVP should stay a React SPA talking to a Spring Boot API.

## Backend Rules

Use this package direction:

```text
com.opspilot
|-- global
|   |-- config
|   |-- error
|   |-- response
|   `-- security
|-- domain
|   |-- incident
|   |-- incidentlog
|   |-- runbook
|   |-- analysis
|   |-- resolution
|   |-- dashboard
|   `-- user
`-- infra
    |-- llm
    |-- search
    `-- embedding
```

Keep LLM provider code behind an interface:

```java
public interface LlmClient {
    AiAnalysisResponse analyzeIncident(AiAnalysisRequest request);
}
```

Use Flyway migrations for DB schema changes. Prefer explicit DTO validation and consistent API responses. Keep search keyword-based for the first MVP and leave vector search as an extension point.

## Frontend Rules

Make the UI feel like an operations tool:

- Use dense, scannable layouts.
- Prefer tables, filters, tabs, forms, status badges, and detail panels.
- Avoid marketing hero sections and decorative visuals.
- Keep Incident Detail as the central workflow screen.
- Use TanStack Query for server state and API mutation flows.
- Use shadcn/ui components for common controls when the frontend project includes it.

Primary screens:

- Dashboard
- Incident List
- Incident Create
- Incident Detail
- Runbook Management
- Analysis Result

## AI Analysis Rules

Never let AI analyze logs without grounding data. Build prompts from:

```text
incident metadata
+ raw logs and extracted keywords
+ similar incidents
+ related runbooks
= AI analysis request
```

Store raw AI responses for traceability. Parse structured fields for UI and search:

- summary
- suspected causes
- check steps
- recommended actions
- related incident IDs
- related runbook IDs
- confidence score

## Verification

Before marking work done:

1. Run the narrowest relevant tests.
2. For backend changes, include unit tests or integration tests when behavior touches persistence, search, or analysis orchestration.
3. For frontend changes, verify the page renders and core workflow interactions work.
4. Update the related issue/Project status.
5. Push the branch and open or update a PR to `develop`.
