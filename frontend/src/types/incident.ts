export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type IncidentStatus =
  | 'OPEN'
  | 'ANALYZING'
  | 'MITIGATED'
  | 'RESOLVED'
  | 'CLOSED'

export type Incident = {
  id: number
  title: string
  serviceName: string
  severity: Severity
  status: IncidentStatus
  occurredAt: string
  updatedAt: string
  keywords: string[]
}

export type IncidentSummary = {
  total: number
  open: number
  highRisk: number
  analyzed: number
}
