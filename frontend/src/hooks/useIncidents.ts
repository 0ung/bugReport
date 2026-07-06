import { useQuery } from '@tanstack/react-query'
import { fetchIncident, fetchIncidents, fetchIncidentSummary } from '../api/incidents'

export function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: fetchIncidents,
  })
}

export function useIncident(incidentId: number) {
  return useQuery({
    queryKey: ['incidents', incidentId],
    queryFn: () => fetchIncident(incidentId),
    enabled: Number.isFinite(incidentId),
  })
}

export function useIncidentSummary() {
  return useQuery({
    queryKey: ['incidents', 'summary'],
    queryFn: fetchIncidentSummary,
  })
}
