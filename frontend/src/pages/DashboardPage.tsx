import { Activity, AlertTriangle, CheckCircle2, FileSearch } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { useIncidents, useIncidentSummary } from '../hooks/useIncidents'

export function DashboardPage() {
  const summaryQuery = useIncidentSummary()
  const incidentsQuery = useIncidents()
  const summary = summaryQuery.data
  const recentIncidents = incidentsQuery.data?.slice(0, 4) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Operations overview</p>
          <h2 className="text-2xl font-semibold text-slate-950">
            Incident response dashboard
          </h2>
        </div>
        <Link
          to="/incidents"
          className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
        >
          View incidents
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total incidents"
          value={summary?.total ?? '-'}
          helper="Tracked cases in MVP data"
          icon={Activity}
        />
        <StatCard
          label="Open incidents"
          value={summary?.open ?? '-'}
          helper="Require operator attention"
          icon={AlertTriangle}
        />
        <StatCard
          label="High risk"
          value={summary?.highRisk ?? '-'}
          helper="HIGH or CRITICAL severity"
          icon={FileSearch}
        />
        <StatCard
          label="Analyzed"
          value={summary?.analyzed ?? '-'}
          helper="AI-ready or resolved cases"
          icon={CheckCircle2}
        />
      </div>

      <section className="rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-950">Recent incidents</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Incident</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-950">
                    <Link to={`/incidents/${incident.id}`}>{incident.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{incident.serviceName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={incident.severity} tone="severity" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={incident.status} tone="status" />
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(incident.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
