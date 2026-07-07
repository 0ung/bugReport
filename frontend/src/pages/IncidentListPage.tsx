import { Filter, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../components/StatusBadge'
import { useIncidents } from '../hooks/useIncidents'
import { useLanguage } from '../i18n/language'
import type { Incident, IncidentStatus, Severity } from '../types/incident'

const severityOptions: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const statusOptions: IncidentStatus[] = ['OPEN', 'ANALYZING', 'MITIGATED', 'RESOLVED', 'CLOSED']
const emptyIncidents: Incident[] = []

export function IncidentListPage() {
  const { formatDateTime, t } = useLanguage()
  const incidentsQuery = useIncidents()
  const incidents = incidentsQuery.data ?? emptyIncidents
  const [query, setQuery] = useState('')
  const [service, setService] = useState('')
  const [severity, setSeverity] = useState('')
  const [status, setStatus] = useState('')

  const services = useMemo(
    () => [...new Set(incidents.map((incident) => incident.serviceName))].sort(),
    [incidents],
  )

  const filteredIncidents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return incidents.filter((incident) => {
      const haystack = [
        incident.title,
        incident.description,
        incident.serviceName,
        incident.owner,
        ...incident.keywords,
      ]
        .join(' ')
        .toLowerCase()

      return (
        (!normalizedQuery || haystack.includes(normalizedQuery)) &&
        (!service || incident.serviceName === service) &&
        (!severity || incident.severity === severity) &&
        (!status || incident.status === status)
      )
    })
  }, [incidents, query, service, severity, status])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{t('incidents.eyebrow')}</p>
          <h2 className="text-2xl font-semibold text-slate-950">{t('incidents.title')}</h2>
        </div>
        <Link
          to="/incidents/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          {t('action.registerIncident')}
        </Link>
      </div>

      <section className="rounded-md border border-slate-200 bg-white">
        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(140px,0.7fr))]">
          <label className="relative">
            <span className="sr-only">{t('incidents.search')}</span>
            <Search aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-9 text-sm outline-none focus:border-slate-400"
              placeholder={t('incidents.searchPlaceholder')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
            value={service}
            onChange={(event) => setService(event.target.value)}
          >
            <option value="">{t('incidents.allServices')}</option>
            {services.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
          >
            <option value="">{t('incidents.allSeverity')}</option>
            {severityOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">{t('incidents.allStatus')}</option>
            {statusOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-sm text-slate-500">
          <Filter aria-hidden="true" className="h-4 w-4" />
          {t('incidents.matched', { count: filteredIncidents.length })}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">{t('common.title')}</th>
                <th className="px-4 py-3">{t('common.service')}</th>
                <th className="px-4 py-3">{t('common.owner')}</th>
                <th className="px-4 py-3">{t('common.severity')}</th>
                <th className="px-4 py-3">{t('common.status')}</th>
                <th className="px-4 py-3">{t('common.keywords')}</th>
                <th className="px-4 py-3">{t('common.updated')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-slate-50">
                  <td className="max-w-sm px-4 py-3">
                    <Link
                      to={`/incidents/${incident.id}`}
                      className="font-medium text-slate-950 hover:text-slate-700"
                    >
                      {incident.title}
                    </Link>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">{incident.description}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{incident.serviceName}</td>
                  <td className="px-4 py-3 text-slate-600">{incident.owner}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={incident.severity} tone="severity" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={incident.status} tone="status" />
                  </td>
                  <td className="max-w-xs px-4 py-3 text-slate-500">
                    <div className="flex flex-wrap gap-1">
                      {incident.keywords.slice(0, 3).map((keyword) => (
                        <span key={keyword} className="rounded-md bg-slate-100 px-2 py-1 text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(incident.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
