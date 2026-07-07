import type {
  AiAnalysis,
  AiFeedback,
  CreateFeedbackInput,
  CreateIncidentInput,
  CreateResolutionInput,
  CreateRunbookInput,
  DashboardData,
  Incident,
  IncidentDetail,
  IncidentLog,
  IncidentSummary,
  KeywordStat,
  ResolutionHistory,
  Runbook,
  SeverityStat,
  SimilarIncident,
} from '../types/incident'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
  timestamp: string
}

type ApiIncident = Omit<
  Incident,
  'analysisId' | 'feedbackId' | 'logIds' | 'resolutionId'
>

type ApiIncidentDetail = ApiIncident & {
  logs: IncidentLog[]
  relatedRunbooks: Runbook[]
  similarIncidents: SimilarIncident[]
  analysis: AiAnalysis | null
  resolution: ResolutionHistory | null
  feedback: AiFeedback | null
}

type ApiDashboardData = Omit<DashboardData, 'analysisQueue' | 'recentIncidents'> & {
  recentIncidents: ApiIncident[]
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })
  const body = (await response.json()) as ApiResponse<T>

  if (!response.ok || !body.success) {
    throw new Error(body.message || `API request failed: ${response.status}`)
  }

  return body.data
}

function toIncident(apiIncident: ApiIncident, detail?: ApiIncidentDetail): Incident {
  return {
    ...apiIncident,
    logIds: detail?.logs.map((log) => log.id) ?? [],
    analysisId: detail?.analysis?.id,
    resolutionId: detail?.resolution?.id,
    feedbackId: detail?.feedback?.id,
  }
}

function toIncidentDetail(apiIncident: ApiIncidentDetail): IncidentDetail {
  return {
    ...toIncident(apiIncident, apiIncident),
    logs: apiIncident.logs ?? [],
    relatedRunbooks: apiIncident.relatedRunbooks ?? [],
    similarIncidents: apiIncident.similarIncidents ?? [],
    analysis: apiIncident.analysis ?? undefined,
    resolution: apiIncident.resolution ?? undefined,
    feedback: apiIncident.feedback ?? undefined,
  }
}

function buildAnalysisQueue(incidents: Incident[]) {
  return incidents
    .filter((incident) => incident.status === 'OPEN' || incident.status === 'ANALYZING')
    .slice(0, 4)
}

export async function fetchIncidents(): Promise<Incident[]> {
  const incidents = await apiRequest<ApiIncident[]>('/incidents')

  return incidents.map((incident) => toIncident(incident))
}

export async function fetchIncident(incidentId: number): Promise<IncidentDetail> {
  const incident = await apiRequest<ApiIncidentDetail>(`/incidents/${incidentId}`)

  return toIncidentDetail(incident)
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [dashboard, incidents] = await Promise.all([
    apiRequest<ApiDashboardData>('/dashboard'),
    fetchIncidents(),
  ])

  return {
    summary: dashboard.summary as IncidentSummary,
    severityStats: dashboard.severityStats as SeverityStat[],
    topKeywords: dashboard.topKeywords as KeywordStat[],
    recentIncidents: dashboard.recentIncidents.map((incident) => toIncident(incident)),
    analysisQueue: buildAnalysisQueue(incidents),
  }
}

export async function fetchRunbooks(): Promise<Runbook[]> {
  return apiRequest<Runbook[]>('/runbooks')
}

export async function fetchAnalysisResults(): Promise<AiAnalysis[]> {
  return apiRequest<AiAnalysis[]>('/analysis')
}

export async function createIncident(input: CreateIncidentInput): Promise<IncidentDetail> {
  const incident = await apiRequest<ApiIncidentDetail>('/incidents', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return toIncidentDetail(incident)
}

export async function createRunbook(input: CreateRunbookInput): Promise<Runbook> {
  return apiRequest<Runbook>('/runbooks', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function requestIncidentAnalysis(incidentId: number): Promise<AiAnalysis> {
  return apiRequest<AiAnalysis>(`/incidents/${incidentId}/analysis`, {
    method: 'POST',
  })
}

export async function createResolution(input: CreateResolutionInput): Promise<IncidentDetail> {
  await apiRequest<ResolutionHistory>(`/incidents/${input.incidentId}/resolution`, {
    method: 'POST',
    body: JSON.stringify({
      actionSummary: input.actionSummary,
      rootCause: input.rootCause,
      resolvedBy: input.resolvedBy,
      preventionNotes: input.preventionNotes,
    }),
  })

  return fetchIncident(input.incidentId)
}

export async function createFeedback(input: CreateFeedbackInput): Promise<IncidentDetail> {
  await apiRequest<AiFeedback>(`/incidents/${input.incidentId}/feedback`, {
    method: 'POST',
    body: JSON.stringify({
      rating: input.rating,
      note: input.note,
    }),
  })

  return fetchIncident(input.incidentId)
}
