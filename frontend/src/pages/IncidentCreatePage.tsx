import { ArrowLeft, ClipboardPlus, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateIncident } from '../hooks/useIncidents'
import { useLanguage } from '../i18n/language'
import type { IncidentSource, Severity } from '../types/incident'

const severityOptions: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const sourceOptions: IncidentSource[] = ['ALERT', 'CUSTOMER', 'DEPLOYMENT', 'MANUAL']

const keywordPreview = (text: string) =>
  [
    '502',
    'upstream timeout',
    'SocketTimeoutException',
    'Connection reset by peer',
    'retry',
    'external api',
    'HikariPool',
    'connection timeout',
    'JWT',
    'latency',
  ].filter((keyword) => text.toLowerCase().includes(keyword.toLowerCase()))

export function IncidentCreatePage() {
  const { severityLabel, sourceLabel, t } = useLanguage()
  const navigate = useNavigate()
  const createIncidentMutation = useCreateIncident()
  const [title, setTitle] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [severity, setSeverity] = useState<Severity>('HIGH')
  const [source, setSource] = useState<IncidentSource>('ALERT')
  const [owner, setOwner] = useState('')
  const [affectedUsers, setAffectedUsers] = useState(0)
  const [description, setDescription] = useState('')
  const [rawLog, setRawLog] = useState('')

  const previewKeywords = useMemo(
    () => keywordPreview(`${title} ${description} ${rawLog}`),
    [description, rawLog, title],
  )
  const canSubmit =
    title.trim().length > 0 &&
    serviceName.trim().length > 0 &&
    owner.trim().length > 0 &&
    description.trim().length > 0 &&
    rawLog.trim().length > 0

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()

        if (!canSubmit) {
          return
        }

        createIncidentMutation.mutate(
          {
            title,
            serviceName,
            severity,
            source,
            owner,
            affectedUsers,
            description,
            rawLog,
          },
          {
            onSuccess: (incident) => navigate(`/incidents/${incident.id}`),
          },
        )
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/incidents"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            {t('incidents.title')}
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{t('action.registerIncident')}</h2>
        </div>
        <button
          type="submit"
          disabled={!canSubmit || createIncidentMutation.isPending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <ClipboardPlus aria-hidden="true" className="h-4 w-4" />
          {createIncidentMutation.isPending ? t('action.registering') : t('action.createIncident')}
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-950">{t('incidentCreate.metadata')}</h3>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="text-sm font-medium text-slate-700">{t('common.title')}</span>
              <input
                className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t('incidentCreate.titlePlaceholder')}
              />
            </label>
            <label>
              <span className="text-sm font-medium text-slate-700">{t('common.service')}</span>
              <input
                className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                value={serviceName}
                onChange={(event) => setServiceName(event.target.value)}
                placeholder={t('incidentCreate.servicePlaceholder')}
              />
            </label>
            <label>
              <span className="text-sm font-medium text-slate-700">{t('common.owner')}</span>
              <input
                className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                placeholder={t('incidentCreate.ownerPlaceholder')}
              />
            </label>
            <label>
              <span className="text-sm font-medium text-slate-700">{t('common.severity')}</span>
              <select
                className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                value={severity}
                onChange={(event) => setSeverity(event.target.value as Severity)}
              >
                {severityOptions.map((item) => (
                  <option key={item} value={item}>
                    {severityLabel(item)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-medium text-slate-700">{t('common.source')}</span>
              <select
                className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                value={source}
                onChange={(event) => setSource(event.target.value as IncidentSource)}
              >
                {sourceOptions.map((item) => (
                  <option key={item} value={item}>
                    {sourceLabel(item)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-medium text-slate-700">{t('incident.affectedUsers')}</span>
              <input
                className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                min={0}
                type="number"
                value={affectedUsers}
                onChange={(event) => setAffectedUsers(Number(event.target.value))}
              />
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-medium text-slate-700">{t('incidentCreate.description')}</span>
              <textarea
                className="mt-1 min-h-28 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t('incidentCreate.descriptionPlaceholder')}
              />
            </label>
          </div>
        </section>

        <section className="rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-950">{t('incidentCreate.groundingPreview')}</h3>
          </div>
          <div className="space-y-4 p-4">
            <div>
              <p className="text-sm font-medium text-slate-700">{t('incident.extractedKeywords')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(previewKeywords.length > 0 ? previewKeywords : [t('incidentCreate.waitingForLogs')]).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                {t('incidentCreate.aiReadyContext')}
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {t('incidentCreate.aiReadyDescription')}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-950">{t('incidentCreate.initialLog')}</h3>
        </div>
        <div className="p-4">
          <textarea
            className="min-h-48 w-full resize-y rounded-md border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-sm text-slate-100 outline-none focus:border-slate-400"
            value={rawLog}
            onChange={(event) => setRawLog(event.target.value)}
            placeholder={t('incidentCreate.initialLogPlaceholder')}
          />
        </div>
      </section>
    </form>
  )
}
