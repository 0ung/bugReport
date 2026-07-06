export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type IncidentStatus =
  | 'OPEN'
  | 'ANALYZING'
  | 'MITIGATED'
  | 'RESOLVED'
  | 'CLOSED'

export type IncidentSource = 'ALERT' | 'CUSTOMER' | 'DEPLOYMENT' | 'MANUAL'

export type LogLevel = 'INFO' | 'WARN' | 'ERROR'

export type Incident = {
  id: number
  title: string
  serviceName: string
  severity: Severity
  status: IncidentStatus
  source: IncidentSource
  owner: string
  affectedUsers: number
  description: string
  occurredAt: string
  updatedAt: string
  keywords: string[]
  logIds: number[]
  relatedRunbookIds: number[]
  similarIncidentIds: number[]
  analysisId?: number
  resolutionId?: number
  feedbackId?: number
}

export type IncidentLog = {
  id: number
  incidentId: number
  level: LogLevel
  source: string
  message: string
  capturedAt: string
  extractedKeywords: string[]
}

export type Runbook = {
  id: number
  title: string
  serviceName: string
  category: string
  owner: string
  updatedAt: string
  triggerKeywords: string[]
  steps: string[]
  linkedIncidentIds: number[]
}

export type SimilarIncident = {
  incidentId: number
  title: string
  serviceName: string
  status: IncidentStatus
  matchedKeywords: string[]
  score: number
  resolvedAt?: string
}

export type AiAnalysis = {
  id: number
  incidentId: number
  createdAt: string
  confidenceScore: number
  summary: string
  suspectedCauses: string[]
  checkSteps: string[]
  recommendedActions: string[]
  relatedIncidentIds: number[]
  relatedRunbookIds: number[]
  rawResponse: string
}

export type ResolutionHistory = {
  id: number
  incidentId: number
  actionSummary: string
  rootCause: string
  resolvedBy: string
  resolvedAt: string
  preventionNotes: string
}

export type FeedbackRating = 'HELPFUL' | 'PARTIAL' | 'MISLEADING'

export type AiFeedback = {
  id: number
  incidentId: number
  rating: FeedbackRating
  note: string
  createdAt: string
}

export type IncidentDetail = Incident & {
  logs: IncidentLog[]
  relatedRunbooks: Runbook[]
  similarIncidents: SimilarIncident[]
  analysis?: AiAnalysis
  resolution?: ResolutionHistory
  feedback?: AiFeedback
}

export type IncidentSummary = {
  total: number
  open: number
  highRisk: number
  analyzed: number
  resolved: number
}

export type SeverityStat = {
  severity: Severity
  count: number
}

export type KeywordStat = {
  keyword: string
  count: number
}

export type DashboardData = {
  summary: IncidentSummary
  severityStats: SeverityStat[]
  topKeywords: KeywordStat[]
  recentIncidents: Incident[]
  analysisQueue: Incident[]
}

export type CreateIncidentInput = {
  title: string
  serviceName: string
  severity: Severity
  source: IncidentSource
  owner: string
  affectedUsers: number
  description: string
  rawLog: string
}

export type CreateRunbookInput = {
  title: string
  serviceName: string
  category: string
  owner: string
  triggerKeywords: string[]
  steps: string[]
}

export type CreateResolutionInput = {
  incidentId: number
  actionSummary: string
  rootCause: string
  resolvedBy: string
  preventionNotes: string
}

export type CreateFeedbackInput = {
  incidentId: number
  rating: FeedbackRating
  note: string
}
