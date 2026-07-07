import type { IncidentStatus, Severity } from '../types/incident'
import { useLanguage } from '../i18n/language'

const severityClasses: Record<Severity, string> = {
  LOW: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 ring-amber-200',
  HIGH: 'bg-orange-50 text-orange-700 ring-orange-200',
  CRITICAL: 'bg-red-50 text-red-700 ring-red-200',
}

const statusClasses: Record<IncidentStatus, string> = {
  OPEN: 'bg-red-50 text-red-700 ring-red-200',
  ANALYZING: 'bg-blue-50 text-blue-700 ring-blue-200',
  MITIGATED: 'bg-violet-50 text-violet-700 ring-violet-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-600 ring-slate-200',
}

type StatusBadgeProps = {
  value: IncidentStatus | Severity
  tone: 'status' | 'severity'
}

export function StatusBadge({ value, tone }: StatusBadgeProps) {
  const { severityLabel, statusLabel } = useLanguage()
  const classes =
    tone === 'status'
      ? statusClasses[value as IncidentStatus]
      : severityClasses[value as Severity]
  const label =
    tone === 'status'
      ? statusLabel(value as IncidentStatus)
      : severityLabel(value as Severity)

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ${classes}`}
    >
      {label}
    </span>
  )
}
