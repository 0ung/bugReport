import { incidents } from './mockData'
import type { Incident, IncidentSummary } from '../types/incident'

const wait = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms))

export async function fetchIncidents(): Promise<Incident[]> {
  await wait()
  return incidents
}

export async function fetchIncident(incidentId: number): Promise<Incident | undefined> {
  await wait()
  return incidents.find((incident) => incident.id === incidentId)
}

export async function fetchIncidentSummary(): Promise<IncidentSummary> {
  await wait()

  return {
    total: incidents.length,
    open: incidents.filter((incident) => incident.status === 'OPEN').length,
    highRisk: incidents.filter((incident) =>
      ['HIGH', 'CRITICAL'].includes(incident.severity),
    ).length,
    analyzed: incidents.filter((incident) =>
      ['ANALYZING', 'MITIGATED', 'RESOLVED'].includes(incident.status),
    ).length,
  }
}
