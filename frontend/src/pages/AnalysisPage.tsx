import { BrainCircuit, FileJson2, SearchCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAnalysisResults, useIncidents, useRunbooks } from '../hooks/useIncidents'
import { useLanguage } from '../i18n/language'
import type { AiAnalysis, Incident, Runbook } from '../types/incident'

const emptyAnalyses: AiAnalysis[] = []
const emptyIncidents: Incident[] = []
const emptyRunbooks: Runbook[] = []

export function AnalysisPage() {
  const { formatDateTime, t } = useLanguage()
  const analysisQuery = useAnalysisResults()
  const incidentsQuery = useIncidents()
  const runbooksQuery = useRunbooks()
  const analyses = analysisQuery.data ?? emptyAnalyses
  const incidents = incidentsQuery.data ?? emptyIncidents
  const runbooks = runbooksQuery.data ?? emptyRunbooks
  const [selectedId, setSelectedId] = useState<number | undefined>(analyses[0]?.id)
  const selectedAnalysis = analyses.find((analysis) => analysis.id === selectedId) ?? analyses[0]
  const incident = incidents.find((item) => item.id === selectedAnalysis?.incidentId)
  const relatedRunbooks = useMemo(
    () =>
      runbooks.filter((runbook) =>
        selectedAnalysis?.relatedRunbookIds.includes(runbook.id),
      ),
    [runbooks, selectedAnalysis],
  )

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{t('analysis.eyebrow')}</p>
        <h2 className="text-2xl font-semibold text-slate-950">{t('analysis.title')}</h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-950">{t('analysis.storedResults')}</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {analyses.map((analysis) => {
              const itemIncident = incidents.find((item) => item.id === analysis.incidentId)

              return (
                <li key={analysis.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(analysis.id)}
                    className={[
                      'w-full px-4 py-3 text-left hover:bg-slate-50',
                      selectedAnalysis?.id === analysis.id ? 'bg-slate-50' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-950">
                        {itemIncident?.title ?? `Incident #${analysis.incidentId}`}
                      </span>
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                        {analysis.confidenceScore}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(analysis.createdAt)}</p>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rounded-md border border-slate-200 bg-white">
          {selectedAnalysis ? (
            <div className="space-y-5 p-4">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {incident?.serviceName ?? t('analysis.unknownService')}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">
                    {incident?.title ?? `Incident #${selectedAnalysis.incidentId}`}
                  </h3>
                </div>
                <Link
                  to={`/incidents/${selectedAnalysis.incidentId}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <SearchCheck aria-hidden="true" className="h-4 w-4" />
                  {t('action.openIncident')}
                </Link>
              </div>

              <div className="rounded-md border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <BrainCircuit aria-hidden="true" className="h-4 w-4" />
                  {t('common.summary')}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{selectedAnalysis.summary}</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <AnalysisColumn title={t('incident.suspectedCauses')} items={selectedAnalysis.suspectedCauses} />
                <AnalysisColumn title={t('incident.checkSteps')} items={selectedAnalysis.checkSteps} />
                <AnalysisColumn title={t('incident.recommendedActions')} items={selectedAnalysis.recommendedActions} />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-950">{t('incident.relatedRunbooks')}</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {relatedRunbooks.map((runbook) => (
                    <Link
                      key={runbook.id}
                      to="/runbooks"
                      className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      {runbook.title}
                    </Link>
                  ))}
                </div>
              </div>

              <details className="rounded-md border border-slate-200 p-4">
                <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-950">
                  <FileJson2 aria-hidden="true" className="h-4 w-4" />
                  {t('analysis.rawResponse')}
                </summary>
                <pre className="mt-3 whitespace-pre-wrap rounded-md bg-slate-950 p-3 font-mono text-xs text-slate-100">
                  {selectedAnalysis.rawResponse}
                </pre>
              </details>
            </div>
          ) : (
            <div className="p-4 text-sm text-slate-500">{t('analysis.noResult')}</div>
          )}
        </section>
      </div>
    </div>
  )
}

function AnalysisColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
      <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </div>
  )
}
