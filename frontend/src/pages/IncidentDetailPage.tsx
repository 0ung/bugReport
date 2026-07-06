import {
  ArrowLeft,
  BookOpenText,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  ListChecks,
  MessageSquareText,
  Play,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StatusBadge } from '../components/StatusBadge'
import {
  useCreateFeedback,
  useCreateResolution,
  useIncident,
  useRequestAnalysis,
} from '../hooks/useIncidents'
import type { FeedbackRating } from '../types/incident'

type DetailTab = 'overview' | 'logs' | 'analysis' | 'resolution'

const tabs: Array<{ id: DetailTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'logs', label: 'Logs' },
  { id: 'analysis', label: 'AI analysis' },
  { id: 'resolution', label: 'Resolution' },
]

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

export function IncidentDetailPage() {
  const params = useParams()
  const incidentId = Number(params.incidentId)
  const incidentQuery = useIncident(incidentId)
  const requestAnalysisMutation = useRequestAnalysis()
  const createResolutionMutation = useCreateResolution()
  const createFeedbackMutation = useCreateFeedback()
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const [actionSummary, setActionSummary] = useState('')
  const [rootCause, setRootCause] = useState('')
  const [resolvedBy, setResolvedBy] = useState('platform-oncall')
  const [preventionNotes, setPreventionNotes] = useState('')
  const [rating, setRating] = useState<FeedbackRating>('HELPFUL')
  const [feedbackNote, setFeedbackNote] = useState('')
  const incident = incidentQuery.data

  if (incidentQuery.isLoading) {
    return <div className="text-sm text-slate-500">Loading incident...</div>
  }

  if (!incident) {
    return <div className="text-sm text-slate-500">Incident not found.</div>
  }

  const hasResolutionForm =
    actionSummary.trim().length > 0 && rootCause.trim().length > 0 && resolvedBy.trim().length > 0
  const overviewStats = [
    { label: 'Logs', value: incident.logs.length, icon: ListChecks },
    { label: 'Runbooks', value: incident.relatedRunbooks.length, icon: BookOpenText },
    { label: 'Similar cases', value: incident.similarIncidents.length, icon: FileSearch },
  ]
  const groundingItems = [
    { label: 'Metadata', done: true },
    { label: 'Logs', done: incident.logs.length > 0 },
    { label: 'Similar incidents', done: incident.similarIncidents.length > 0 },
    { label: 'Related runbooks', done: incident.relatedRunbooks.length > 0 },
    { label: 'Resolution', done: Boolean(incident.resolution) },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/incidents"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Incidents
          </Link>
          <p className="mt-3 text-sm font-medium text-slate-500">
            #{incident.id} / {incident.serviceName} / {incident.owner}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">{incident.title}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={incident.severity} tone="severity" />
          <StatusBadge value={incident.status} tone="status" />
        </div>
      </div>

      <section className="rounded-md border border-slate-200 bg-white">
        <div className="grid gap-4 p-4 md:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Source</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{incident.source}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Affected users</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">
              {incident.affectedUsers.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Occurred</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{formatDate(incident.occurredAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Updated</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{formatDate(incident.updatedAt)}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-4">
          <section className="rounded-md border border-slate-200 bg-white">
            <div className="flex gap-1 border-b border-slate-200 px-3 py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'rounded-md px-3 py-2 text-sm font-medium',
                    activeTab === tab.id
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-5 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">Incident summary</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{incident.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">Extracted keywords</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
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
                <div className="grid gap-3 md:grid-cols-3">
                  {overviewStats.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-md border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">{label}</p>
                        <Icon aria-hidden="true" className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="divide-y divide-slate-100">
                {incident.logs.map((log) => (
                  <article key={log.id} className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {log.level}
                        </span>
                        <span className="text-sm font-medium text-slate-700">{log.source}</span>
                      </div>
                      <span className="text-xs text-slate-500">{formatDate(log.capturedAt)}</span>
                    </div>
                    <pre className="whitespace-pre-wrap rounded-md bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100">
                      {log.message}
                    </pre>
                    <div className="flex flex-wrap gap-2">
                      {log.extractedKeywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">Grounded AI analysis</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Uses metadata, logs, similar incidents, and runbooks as context.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => requestAnalysisMutation.mutate(incident.id)}
                    disabled={requestAnalysisMutation.isPending}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-300"
                  >
                    <Play aria-hidden="true" className="h-4 w-4" />
                    {incident.analysis ? 'Refresh analysis' : 'Request analysis'}
                  </button>
                </div>

                {incident.analysis ? (
                  <div className="space-y-5">
                    <div className="rounded-md border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-950">Summary</h4>
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                          {incident.analysis.confidenceScore}% confidence
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{incident.analysis.summary}</p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <AnalysisList title="Suspected causes" items={incident.analysis.suspectedCauses} />
                      <AnalysisList title="Check steps" items={incident.analysis.checkSteps} />
                      <AnalysisList title="Recommended actions" items={incident.analysis.recommendedActions} />
                    </div>
                    <details className="rounded-md border border-slate-200 p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-slate-950">
                        Raw AI response
                      </summary>
                      <pre className="mt-3 whitespace-pre-wrap rounded-md bg-slate-950 p-3 font-mono text-xs text-slate-100">
                        {incident.analysis.rawResponse}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                    This incident has logs and keywords ready. Run analysis to create a structured
                    diagnosis.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resolution' && (
              <div className="space-y-5 p-4">
                {incident.resolution ? (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                      <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                      Resolved by {incident.resolution.resolvedBy}
                    </div>
                    <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                      <div>
                        <dt className="font-medium text-emerald-950">Action</dt>
                        <dd className="mt-1 text-emerald-800">{incident.resolution.actionSummary}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-emerald-950">Root cause</dt>
                        <dd className="mt-1 text-emerald-800">{incident.resolution.rootCause}</dd>
                      </div>
                      <div className="md:col-span-2">
                        <dt className="font-medium text-emerald-950">Prevention notes</dt>
                        <dd className="mt-1 text-emerald-800">{incident.resolution.preventionNotes}</dd>
                      </div>
                    </dl>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <label>
                      <span className="text-sm font-medium text-slate-700">Action summary</span>
                      <textarea
                        className="mt-1 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                        value={actionSummary}
                        onChange={(event) => setActionSummary(event.target.value)}
                        placeholder="Describe the actual mitigation or fix."
                      />
                    </label>
                    <label>
                      <span className="text-sm font-medium text-slate-700">Root cause</span>
                      <input
                        className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                        value={rootCause}
                        onChange={(event) => setRootCause(event.target.value)}
                        placeholder="External provider timeout, connection leak, deployment mismatch..."
                      />
                    </label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label>
                        <span className="text-sm font-medium text-slate-700">Resolved by</span>
                        <input
                          className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                          value={resolvedBy}
                          onChange={(event) => setResolvedBy(event.target.value)}
                        />
                      </label>
                      <label>
                        <span className="text-sm font-medium text-slate-700">Prevention notes</span>
                        <input
                          className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                          value={preventionNotes}
                          onChange={(event) => setPreventionNotes(event.target.value)}
                          placeholder="Follow-up item or runbook update"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      disabled={!hasResolutionForm || createResolutionMutation.isPending}
                      onClick={() =>
                        createResolutionMutation.mutate({
                          incidentId: incident.id,
                          actionSummary,
                          rootCause,
                          resolvedBy,
                          preventionNotes,
                        })
                      }
                      className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
                      Mark resolved
                    </button>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-semibold text-slate-950">AI feedback</h3>
                  {incident.feedback ? (
                    <div className="mt-3 rounded-md border border-slate-200 p-4 text-sm text-slate-600">
                      <p className="font-medium text-slate-950">{incident.feedback.rating}</p>
                      <p className="mt-2">{incident.feedback.note}</p>
                    </div>
                  ) : (
                    <div className="mt-3 grid gap-3">
                      <select
                        className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                        value={rating}
                        onChange={(event) => setRating(event.target.value as FeedbackRating)}
                      >
                        <option value="HELPFUL">Helpful</option>
                        <option value="PARTIAL">Partial</option>
                        <option value="MISLEADING">Misleading</option>
                      </select>
                      <textarea
                        className="min-h-20 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                        value={feedbackNote}
                        onChange={(event) => setFeedbackNote(event.target.value)}
                        placeholder="Was the analysis useful for this incident?"
                      />
                      <button
                        type="button"
                        disabled={feedbackNote.trim().length === 0 || createFeedbackMutation.isPending}
                        onClick={() =>
                          createFeedbackMutation.mutate({
                            incidentId: incident.id,
                            rating,
                            note: feedbackNote,
                          })
                        }
                        className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                      >
                        <MessageSquareText aria-hidden="true" className="h-4 w-4" />
                        Save feedback
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-950">Grounding data</h3>
            </div>
            <div className="space-y-3 p-4">
              {groundingItems.map(({ label, done }) => (
                <div key={label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600">{label}</span>
                  <span
                    className={[
                      'rounded-md px-2 py-1 text-xs font-medium ring-1',
                      done
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        : 'bg-slate-100 text-slate-500 ring-slate-200',
                    ].join(' ')}
                  >
                    {done ? 'Ready' : 'Missing'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-950">Related runbooks</h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {incident.relatedRunbooks.map((runbook) => (
                <li key={runbook.id} className="p-4">
                  <Link to="/runbooks" className="text-sm font-medium text-slate-950 hover:text-slate-700">
                    {runbook.title}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">{runbook.owner}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-950">Similar incidents</h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {incident.similarIncidents.map((similar) => (
                <li key={similar.incidentId} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      to={`/incidents/${similar.incidentId}`}
                      className="text-sm font-medium text-slate-950 hover:text-slate-700"
                    >
                      {similar.title}
                    </Link>
                    <span className="text-xs font-semibold text-slate-500">{similar.score}%</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {similar.matchedKeywords.length > 0 ? (
                      similar.matchedKeywords.map((keyword) => (
                        <span key={keyword} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Matched by incident history</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}

function AnalysisList({ title, items }: { title: string; items: string[] }) {
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
