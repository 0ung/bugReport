import { useParams } from 'react-router-dom'
import { StatusBadge } from '../components/StatusBadge'
import { useIncident } from '../hooks/useIncidents'

export function IncidentDetailPage() {
  const params = useParams()
  const incidentId = Number(params.incidentId)
  const incidentQuery = useIncident(incidentId)
  const incident = incidentQuery.data

  if (incidentQuery.isLoading) {
    return <div className="text-sm text-slate-500">Loading incident...</div>
  }

  if (!incident) {
    return <div className="text-sm text-slate-500">Incident not found.</div>
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{incident.serviceName}</p>
          <h2 className="text-2xl font-semibold text-slate-950">{incident.title}</h2>
        </div>
        <div className="flex gap-2">
          <StatusBadge value={incident.severity} tone="severity" />
          <StatusBadge value={incident.status} tone="status" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-950">Logs and extracted keywords</h3>
          </div>
          <div className="space-y-4 p-4">
            <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 text-sm text-slate-100">
{`java.net.SocketTimeoutException: Read timed out
org.springframework.web.client.ResourceAccessException
upstream timed out while reading response header from upstream`}
            </pre>
            <div className="flex flex-wrap gap-2">
              {incident.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-950">AI analysis workflow</h3>
          </div>
          <div className="space-y-3 p-4 text-sm text-slate-600">
            <p>
              Grounded analysis will combine incident metadata, logs, similar incidents, and
              runbooks.
            </p>
            <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 font-medium text-white hover:bg-slate-800">
              Request analysis
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
