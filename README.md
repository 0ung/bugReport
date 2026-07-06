# OpsPilot

AI 기반 장애 대응 Runbook Assistant

## 프로젝트 개요

OpsPilot은 운영 로그, 장애 이력, Runbook을 기반으로 유사 장애를 검색하고 AI가 원인 후보, 확인 절차, 추천 조치를 제안하는 장애 대응 보조 시스템입니다.

단순한 AI 챗봇이 아니라, 실제 운영 장애 대응 흐름을 데이터화하고 반복 가능한 대응 절차로 남기는 것을 목표로 합니다.

## 문제 정의

운영 장애가 발생하면 담당자는 보통 로그를 확인하고, 과거에 비슷한 장애가 있었는지 기억을 더듬고, 매뉴얼이나 위키를 찾아본 뒤 임시 조치를 수행합니다. 하지만 이 과정은 사람의 경험과 기억에 의존하기 쉽고, 장애 이후의 대응 이력도 체계적으로 남지 않는 경우가 많습니다.

OpsPilot은 이 흐름을 시스템화합니다.

- 장애 케이스를 등록합니다.
- 관련 로그를 저장하고 주요 키워드를 추출합니다.
- 과거 유사 장애와 관련 Runbook을 검색합니다.
- AI가 근거 데이터를 기반으로 원인 후보와 조치 절차를 추천합니다.
- 실제 조치 결과와 피드백을 저장해 다음 장애 대응에 활용합니다.

## 핵심 기능

- 장애 케이스 등록, 조회, 수정
- 장애 로그 저장 및 키워드 추출
- 과거 유사 장애 검색
- Runbook 등록 및 검색
- AI 기반 장애 분석 요청
- AI 분석 결과 저장 및 조회
- 실제 조치 결과 저장
- AI 추천 결과 피드백
- 장애 통계 대시보드

## MVP 범위

1차 MVP에서는 운영 장애 대응의 핵심 흐름에 집중합니다.

- Incident 관리
- Incident Log 관리
- Runbook 관리
- 키워드 기반 유사 장애 검색
- AI 분석 API
- Resolution 및 Feedback 관리
- 기본 Dashboard

초기 버전에서는 실시간 로그 스트리밍, Kubernetes 연동, Prometheus 연동, Slack 알림, 자동 장애 조치, 복잡한 권한 관리, 멀티 테넌트 기능은 제외합니다.

## 사용자 시나리오

1. 운영자가 장애 케이스를 등록합니다.
2. 장애와 관련된 로그를 붙여넣습니다.
3. 시스템이 로그 키워드를 추출합니다.
4. 과거 장애 이력에서 유사한 케이스를 찾습니다.
5. 관련 Runbook을 검색합니다.
6. AI가 장애 요약, 원인 후보, 확인 절차, 추천 조치를 생성합니다.
7. 운영자가 실제 조치 결과를 저장합니다.
8. 저장된 결과는 다음 장애 분석의 근거 데이터가 됩니다.

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | React, TypeScript |
| Backend | Java 17, Spring Boot |
| Database | PostgreSQL |
| Search | Keyword Search, PostgreSQL Full Text Search, pgvector 후보 |
| AI | LLM API, RAG 흐름 |
| Infra | Docker Compose, GitHub Actions |

## 시스템 구조

```text
[React Frontend]
    |
    | REST API
    v
[Spring Boot Backend]
    |
    | JPA / QueryDSL or MyBatis
    v
[PostgreSQL]
    |
    | Keyword Search / pgvector
    v
[Incident / Log / Runbook Data]

[Spring Boot Backend]
    |
    | LLM API
    v
[AI Analysis Engine]
```

## 주요 도메인

| 도메인 | 설명 |
| --- | --- |
| Incident | 장애 케이스 |
| IncidentLog | 장애 로그 |
| Runbook | 조치 매뉴얼 |
| Analysis | AI 분석 결과 |
| Resolution | 실제 조치 결과 |
| Feedback | AI 추천 결과 피드백 |
| Dashboard | 장애 통계 |
| User | 사용자 |

## AI 분석 흐름

AI가 단독으로 판단하지 않고, 시스템에 저장된 근거 데이터를 함께 사용하도록 설계합니다.

```text
장애 메타데이터
+ 로그 원문 및 추출 키워드
+ 과거 유사 장애
+ 관련 Runbook
= AI 분석 요청
```

AI 응답은 가능한 한 JSON 형식으로 받아 화면 표시와 DB 저장이 쉬운 구조로 관리합니다.

예상 응답 항목:

- 장애 요약
- 원인 후보
- 원인별 근거
- 확인 절차
- 추천 조치
- 관련 장애
- 관련 Runbook
- 신뢰도 점수

## 백엔드 패키지 방향

```text
com.opspilot
├── global
│   ├── config
│   ├── error
│   ├── response
│   └── security
├── domain
│   ├── incident
│   ├── incidentlog
│   ├── runbook
│   ├── analysis
│   ├── resolution
│   ├── dashboard
│   └── user
└── infra
    ├── llm
    ├── search
    └── embedding
```

LLM 연동은 `infra.llm` 영역으로 분리해 OpenAI, Claude, Gemini 등 구현체를 교체할 수 있게 설계합니다.

```java
public interface LlmClient {
    AiAnalysisResponse analyzeIncident(AiAnalysisRequest request);
}
```

## 개발 로드맵

GitHub Issues와 Milestones를 기준으로 애자일식 WBS를 관리합니다.

| Milestone | 목표 |
| --- | --- |
| Milestone 0 - Project Setup | 프로젝트 기반 세팅 |
| Milestone 1 - Incident Management | 장애 케이스 관리 |
| Milestone 2 - Log & Runbook Management | 로그 및 Runbook 관리 |
| Milestone 3 - Search & Similar Incident Matching | 검색 및 유사 장애 매칭 |
| Milestone 4 - AI Analysis | AI 분석 기능 |
| Milestone 5 - Resolution & Feedback | 조치 결과 및 피드백 |
| Milestone 6 - Dashboard & Portfolio Polish | 대시보드 및 포트폴리오 정리 |

## 브랜치 전략

```text
main
develop
feature/{issue-number}-{short-name}
fix/{issue-number}-{short-name}
docs/{issue-number}-{short-name}
```

예시:

```text
feature/9-create-incident-api
feature/17-create-incident-log-api
feature/33-ai-analysis-api
docs/54-architecture-docs
```

## 커밋 메시지 규칙

Conventional Commit 형식을 사용합니다.

```text
feat(incident): add incident create api
feat(log): add incident log keyword extraction
feat(ai): implement ai analysis request
fix(runbook): fix runbook update validation
docs(readme): add project architecture
```

## 포트폴리오 포인트

- 단순 CRUD가 아니라 운영 문제를 해결하는 시스템
- 실제 장애 대응 경험 기반의 도메인 설계
- 로그, 장애 이력, Runbook을 데이터화
- AI를 무작정 붙인 구조가 아니라 근거 기반 RAG 흐름으로 설계
- AI 분석 결과와 피드백까지 저장하는 개선 가능한 구조
- SRE, DevOps, 백엔드 운영 역량과 연결 가능한 프로젝트

