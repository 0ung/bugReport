import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileSearch,
  Gauge,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { useDashboardData } from '../hooks/useIncidents'
import { useLanguage } from '../i18n/language'

export function DashboardPage() {
  const { formatDateTime, t } = useLanguage()
  const dashboardQuery = useDashboardData()
  const data = dashboardQuery.data

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{t('dashboard.eyebrow')}</p>
          <h2 className="text-2xl font-semibold text-slate-950">
            {t('dashboard.title')}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/incidents/new"
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            {t('action.registerIncident')}
          </Link>
          <Link
            to="/analysis"
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('action.analysisQueue')}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label={t('dashboard.total')}
          value={data?.summary.total ?? '-'}
          helper={t('dashboard.totalHelper')}
          icon={Activity}
        />
        <StatCard
          label={t('dashboard.open')}
          value={data?.summary.open ?? '-'}
          helper={t('dashboard.openHelper')}
          icon={AlertTriangle}
        />
        <StatCard
          label={t('dashboard.highRisk')}
          value={data?.summary.highRisk ?? '-'}
          helper={t('dashboard.highRiskHelper')}
          icon={FileSearch}
        />
        <StatCard
          label={t('dashboard.analyzed')}
          value={data?.summary.analyzed ?? '-'}
          helper={t('dashboard.analyzedHelper')}
          icon={Gauge}
        />
        <StatCard
          label={t('dashboard.resolved')}
          value={data?.summary.resolved ?? '-'}
          helper={t('dashboard.resolvedHelper')}
          icon={CheckCircle2}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-md border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-950">{t('dashboard.recentIncidents')}</h3>
            <Link to="/incidents" className="text-sm font-medium text-slate-600 hover:text-slate-950">
              {t('action.viewAll')}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t('incidents.title')}</th>
                  <th className="px-4 py-3">{t('common.service')}</th>
                  <th className="px-4 py-3">{t('common.severity')}</th>
                  <th className="px-4 py-3">{t('common.status')}</th>
                  <th className="px-4 py-3">{t('common.updated')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.recentIncidents ?? []).map((incident) => (
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
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(incident.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-950">{t('dashboard.topKeywords')}</h3>
          </div>
          <div className="space-y-3 p-4">
            {(data?.topKeywords ?? []).map((item) => (
              <div key={item.keyword} className="grid grid-cols-[minmax(0,1fr)_48px] items-center gap-3">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-slate-800">{item.keyword}</span>
                    <span className="text-xs text-slate-500">{item.count}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-slate-900"
                      style={{ width: `${Math.max(18, item.count * 28)}%` }}
                    />
                  </div>
                </div>
                <FileSearch aria-hidden="true" className="h-4 w-4 justify-self-end text-slate-400" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-950">{t('dashboard.severityDistribution')}</h3>
          </div>
          <div className="space-y-3 p-4">
            {(data?.severityStats ?? []).map((item) => (
              <div key={item.severity} className="flex items-center gap-3">
                <div className="w-24">
                  <StatusBadge value={item.severity} tone="severity" />
                </div>
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-slate-900"
                    style={{ width: `${Math.max(10, item.count * 22)}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm text-slate-600">{item.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-950">{t('action.analysisQueue')}</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {(data?.analysisQueue ?? []).map((incident) => (
              <li key={incident.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <Link
                    to={`/incidents/${incident.id}`}
                    className="truncate text-sm font-medium text-slate-950 hover:text-slate-700"
                  >
                    {incident.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                    {formatDateTime(incident.updatedAt)}
                  </div>
                </div>
                <StatusBadge value={incident.status} tone="status" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
