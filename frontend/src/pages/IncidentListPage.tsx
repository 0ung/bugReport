import { Link } from 'react-router-dom'
import { StatusBadge } from '../components/StatusBadge'
import { useIncidents } from '../hooks/useIncidents'

export function IncidentListPage() {
  const incidentsQuery = useIncidents()
  const incidents = incidentsQuery.data ?? []

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-500">Incident management</p>
        <h2 className="text-2xl font-semibold text-slate-950">Incidents</h2>
      </div>

      <section className="rounded-md border border-slate-200 bg-white">
        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-4">
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Search keyword"
          />
          <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue="">
            <option value="">All services</option>
            <option value="payment-api">payment-api</option>
            <option value="order-api">order-api</option>
          </select>
          <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue="">
            <option value="">All severity</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
          <button className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white">
            Register incident
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Keywords</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidents.map((incident) => (
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
                  <td className="px-4 py-3 text-slate-500">{incident.keywords.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
