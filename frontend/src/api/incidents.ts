import {
  analyses,
  feedbacks,
  incidentLogs,
  incidents,
  resolutions,
  runbooks,
} from './mockData'
import type {
  AiAnalysis,
  CreateFeedbackInput,
  CreateIncidentInput,
  CreateResolutionInput,
  CreateRunbookInput,
  DashboardData,
  Incident,
  IncidentDetail,
  IncidentSummary,
  KeywordStat,
  ResolutionHistory,
  Runbook,
  Severity,
  SeverityStat,
  SimilarIncident,
} from '../types/incident'

const wait = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms))

const nowIso = () => new Date().toISOString()

const keywordCandidates = [
  '502',
  'upstream timeout',
  'SocketTimeoutException',
  'Connection reset by peer',
  'retry',
  'external api',
  'batch delayed',
  'HikariPool',
  'connection timeout',
  'JWT',
  'signing key',
  '401',
  'latency',
  'payment',
  'order',
]

function extractKeywords(text: string) {
  const lowerText = text.toLowerCase()
  const matches = keywordCandidates.filter((keyword) =>
    lowerText.includes(keyword.toLowerCase()),
  )

  return [...new Set(matches.length > 0 ? matches : text.split(/\W+/).filter(Boolean).slice(0, 4))]
}

function buildSimilarIncidents(incident: Incident): SimilarIncident[] {
  const ids = new Set(incident.similarIncidentIds)

  return incidents
    .filter((candidate) => candidate.id !== incident.id)
    .map((candidate) => {
      const matchedKeywords = candidate.keywords.filter((keyword) =>
        incident.keywords.some(
          (incidentKeyword) => incidentKeyword.toLowerCase() === keyword.toLowerCase(),
        ),
      )
      const score = ids.has(candidate.id)
        ? 88
        : Math.min(95, matchedKeywords.length * 22 + (candidate.serviceName === incident.serviceName ? 18 : 0))

      return {
        incidentId: candidate.id,
        title: candidate.title,
        serviceName: candidate.serviceName,
        status: candidate.status,
        matchedKeywords,
        score,
        resolvedAt: candidate.resolutionId ? candidate.updatedAt : undefined,
      }
    })
    .filter((candidate) => candidate.score > 0 || ids.has(candidate.incidentId))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
}

function buildIncidentDetail(incident: Incident): IncidentDetail {
  return {
    ...incident,
    logs: incidentLogs.filter((log) => incident.logIds.includes(log.id)),
    relatedRunbooks: runbooks.filter((runbook) => incident.relatedRunbookIds.includes(runbook.id)),
    similarIncidents: buildSimilarIncidents(incident),
    analysis: analyses.find((analysis) => analysis.id === incident.analysisId),
    resolution: resolutions.find((resolution) => resolution.id === incident.resolutionId),
    feedback: feedbacks.find((feedback) => feedback.id === incident.feedbackId),
  }
}

function getIncidentSummary(): IncidentSummary {
  return {
    total: incidents.length,
    open: incidents.filter((incident) => ['OPEN', 'ANALYZING'].includes(incident.status)).length,
    highRisk: incidents.filter((incident) => ['HIGH', 'CRITICAL'].includes(incident.severity)).length,
    analyzed: incidents.filter((incident) => incident.analysisId !== undefined).length,
    resolved: incidents.filter((incident) => ['RESOLVED', 'CLOSED'].includes(incident.status)).length,
  }
}

function getSeverityStats(): SeverityStat[] {
  const severities: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

  return severities.map((severity) => ({
    severity,
    count: incidents.filter((incident) => incident.severity === severity).length,
  }))
}

function getTopKeywords(): KeywordStat[] {
  const counts = new Map<string, number>()

  incidents.forEach((incident) => {
    incident.keywords.forEach((keyword) => {
      counts.set(keyword, (counts.get(keyword) ?? 0) + 1)
    })
  })

  return [...counts.entries()]
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 6)
}

export async function fetchIncidents(): Promise<Incident[]> {
  await wait()
  return [...incidents].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  )
}

export async function fetchIncident(incidentId: number): Promise<IncidentDetail | undefined> {
  await wait()
  const incident = incidents.find((item) => item.id === incidentId)
  return incident ? buildIncidentDetail(incident) : undefined
}

export async function fetchDashboardData(): Promise<DashboardData> {
  await wait()

  return {
    summary: getIncidentSummary(),
    severityStats: getSeverityStats(),
    topKeywords: getTopKeywords(),
    recentIncidents: [...incidents]
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
      .slice(0, 5),
    analysisQueue: incidents
      .filter((incident) => incident.analysisId === undefined || incident.status === 'OPEN')
      .slice(0, 4),
  }
}

export async function fetchRunbooks(): Promise<Runbook[]> {
  await wait()
  return [...runbooks].sort((left, right) => left.title.localeCompare(right.title))
}

export async function fetchAnalysisResults(): Promise<AiAnalysis[]> {
  await wait()
  return [...analyses].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )
}

export async function createIncident(input: CreateIncidentInput): Promise<IncidentDetail> {
  await wait(350)
  const id = Math.max(...incidents.map((incident) => incident.id)) + 1
  const logId = Math.max(...incidentLogs.map((log) => log.id)) + 1
  const keywords = extractKeywords(`${input.title} ${input.description} ${input.rawLog}`)
  const relatedRunbookIds = runbooks
    .filter((runbook) =>
      runbook.triggerKeywords.some((keyword) =>
        keywords.some((item) => item.toLowerCase() === keyword.toLowerCase()),
      ),
    )
    .map((runbook) => runbook.id)

  const createdAt = nowIso()
  const incident: Incident = {
    id,
    title: input.title,
    serviceName: input.serviceName,
    severity: input.severity,
    status: 'OPEN',
    source: input.source,
    owner: input.owner,
    affectedUsers: input.affectedUsers,
    description: input.description,
    occurredAt: createdAt,
    updatedAt: createdAt,
    keywords,
    logIds: [logId],
    relatedRunbookIds,
    similarIncidentIds: [],
  }

  incidentLogs.push({
    id: logId,
    incidentId: id,
    level: input.severity === 'LOW' ? 'WARN' : 'ERROR',
    source: input.serviceName,
    capturedAt: createdAt,
    message: input.rawLog,
    extractedKeywords: keywords,
  })
  incidents.unshift(incident)

  return buildIncidentDetail(incident)
}

export async function createRunbook(input: CreateRunbookInput): Promise<Runbook> {
  await wait(300)
  const runbook: Runbook = {
    id: Math.max(...runbooks.map((item) => item.id)) + 1,
    title: input.title,
    serviceName: input.serviceName,
    category: input.category,
    owner: input.owner,
    triggerKeywords: input.triggerKeywords,
    steps: input.steps,
    linkedIncidentIds: [],
    updatedAt: nowIso(),
  }

  runbooks.unshift(runbook)
  return runbook
}

export async function requestIncidentAnalysis(incidentId: number): Promise<AiAnalysis> {
  await wait(500)
  const incident = incidents.find((item) => item.id === incidentId)

  if (!incident) {
    throw new Error('Incident not found')
  }

  const existingAnalysis = analyses.find((analysis) => analysis.id === incident.analysisId)

  if (existingAnalysis) {
    return existingAnalysis
  }

  const relatedRunbookIds = incident.relatedRunbookIds
  const relatedIncidentIds = buildSimilarIncidents(incident).map((item) => item.incidentId)
  const analysis: AiAnalysis = {
    id: Math.max(...analyses.map((item) => item.id)) + 1,
    incidentId,
    createdAt: nowIso(),
    confidenceScore: relatedRunbookIds.length > 0 ? 76 : 58,
    summary: `${incident.serviceName} shows symptoms related to ${incident.keywords.slice(0, 2).join(' and ')}. The analysis used logs, similar incidents, and runbooks as grounding data.`,
    suspectedCauses: [
      'The primary error keyword appears repeatedly in the attached logs.',
      'Related runbooks point to a known operational failure mode.',
      'Similar incidents show matching service or keyword patterns.',
    ],
    checkSteps: [
      'Confirm whether the latest deployment or external provider status changed.',
      'Compare service error rate with the extracted log keywords.',
      'Open linked runbooks and validate each checklist item.',
    ],
    recommendedActions: [
      'Assign the owning on-call group and keep the incident status in ANALYZING.',
      'Apply the first related runbook checklist before changing infrastructure settings.',
      'Record the final resolution so future analyses can reuse this case.',
    ],
    relatedIncidentIds,
    relatedRunbookIds,
    rawResponse: JSON.stringify({
      summary: 'grounded incident analysis',
      confidence: relatedRunbookIds.length > 0 ? 76 : 58,
      relatedRunbookIds,
      relatedIncidentIds,
    }),
  }

  analyses.unshift(analysis)
  incident.analysisId = analysis.id
  incident.status = 'ANALYZING'
  incident.updatedAt = nowIso()

  return analysis
}

export async function createResolution(input: CreateResolutionInput): Promise<IncidentDetail> {
  await wait(350)
  const incident = incidents.find((item) => item.id === input.incidentId)

  if (!incident) {
    throw new Error('Incident not found')
  }

  const resolution: ResolutionHistory = {
    id: Math.max(...resolutions.map((item) => item.id)) + 1,
    incidentId: input.incidentId,
    actionSummary: input.actionSummary,
    rootCause: input.rootCause,
    resolvedBy: input.resolvedBy,
    preventionNotes: input.preventionNotes,
    resolvedAt: nowIso(),
  }

  resolutions.unshift(resolution)
  incident.resolutionId = resolution.id
  incident.status = 'RESOLVED'
  incident.updatedAt = resolution.resolvedAt

  return buildIncidentDetail(incident)
}

export async function createFeedback(input: CreateFeedbackInput): Promise<IncidentDetail> {
  await wait(250)
  const incident = incidents.find((item) => item.id === input.incidentId)

  if (!incident) {
    throw new Error('Incident not found')
  }

  const feedback: CreateFeedbackInput & { id: number; createdAt: string } = {
    ...input,
    id: Math.max(...feedbacks.map((item) => item.id)) + 1,
    createdAt: nowIso(),
  }

  feedbacks.unshift(feedback)
  incident.feedbackId = feedback.id
  incident.updatedAt = feedback.createdAt

  return buildIncidentDetail(incident)
}
