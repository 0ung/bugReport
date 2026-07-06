import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFeedback,
  createIncident,
  createResolution,
  createRunbook,
  fetchAnalysisResults,
  fetchDashboardData,
  fetchIncident,
  fetchIncidents,
  fetchRunbooks,
  requestIncidentAnalysis,
} from '../api/incidents'

const incidentKeys = {
  all: ['incidents'] as const,
  detail: (incidentId: number) => ['incidents', incidentId] as const,
  dashboard: ['dashboard'] as const,
  runbooks: ['runbooks'] as const,
  analyses: ['analysis-results'] as const,
}

export function useIncidents() {
  return useQuery({
    queryKey: incidentKeys.all,
    queryFn: fetchIncidents,
  })
}

export function useIncident(incidentId: number) {
  return useQuery({
    queryKey: incidentKeys.detail(incidentId),
    queryFn: () => fetchIncident(incidentId),
    enabled: Number.isFinite(incidentId),
  })
}

export function useDashboardData() {
  return useQuery({
    queryKey: incidentKeys.dashboard,
    queryFn: fetchDashboardData,
  })
}

export function useRunbooks() {
  return useQuery({
    queryKey: incidentKeys.runbooks,
    queryFn: fetchRunbooks,
  })
}

export function useAnalysisResults() {
  return useQuery({
    queryKey: incidentKeys.analyses,
    queryFn: fetchAnalysisResults,
  })
}

export function useCreateIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createIncident,
    onSuccess: (incident) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all })
      queryClient.invalidateQueries({ queryKey: incidentKeys.dashboard })
      queryClient.setQueryData(incidentKeys.detail(incident.id), incident)
    },
  })
}

export function useCreateRunbook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRunbook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.runbooks })
      queryClient.invalidateQueries({ queryKey: incidentKeys.dashboard })
    },
  })
}

export function useRequestAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: requestIncidentAnalysis,
    onSuccess: (analysis) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all })
      queryClient.invalidateQueries({ queryKey: incidentKeys.dashboard })
      queryClient.invalidateQueries({ queryKey: incidentKeys.analyses })
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(analysis.incidentId) })
    },
  })
}

export function useCreateResolution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createResolution,
    onSuccess: (incident) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all })
      queryClient.invalidateQueries({ queryKey: incidentKeys.dashboard })
      queryClient.setQueryData(incidentKeys.detail(incident.id), incident)
    },
  })
}

export function useCreateFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createFeedback,
    onSuccess: (incident) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.dashboard })
      queryClient.setQueryData(incidentKeys.detail(incident.id), incident)
    },
  })
}
