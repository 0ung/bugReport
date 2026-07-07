import { BookOpenCheck, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCreateRunbook, useRunbooks } from '../hooks/useIncidents'
import { useLanguage } from '../i18n/language'
import type { Runbook } from '../types/incident'

const emptyRunbooks: Runbook[] = []

export function RunbookPage() {
  const { formatDate, t } = useLanguage()
  const runbooksQuery = useRunbooks()
  const createRunbookMutation = useCreateRunbook()
  const runbooks = runbooksQuery.data ?? emptyRunbooks
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [selectedId, setSelectedId] = useState<number | undefined>(runbooks[0]?.id)
  const [isCreating, setIsCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [owner, setOwner] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [keywords, setKeywords] = useState('')
  const [steps, setSteps] = useState('')

  const categories = useMemo(
    () => [...new Set(runbooks.map((runbook) => runbook.category))].sort(),
    [runbooks],
  )
  const filteredRunbooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return runbooks.filter((runbook) => {
      const haystack = [
        runbook.title,
        runbook.serviceName,
        runbook.category,
        runbook.owner,
        ...runbook.triggerKeywords,
      ]
        .join(' ')
        .toLowerCase()

      return (
        (!normalizedQuery || haystack.includes(normalizedQuery)) &&
        (!category || runbook.category === category)
      )
    })
  }, [category, query, runbooks])
  const selectedRunbook =
    filteredRunbooks.find((runbook) => runbook.id === selectedId) ?? filteredRunbooks[0]
  const canCreate =
    title.trim().length > 0 &&
    serviceName.trim().length > 0 &&
    owner.trim().length > 0 &&
    newCategory.trim().length > 0 &&
    keywords.trim().length > 0 &&
    steps.trim().length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{t('runbooks.eyebrow')}</p>
          <h2 className="text-2xl font-semibold text-slate-950">{t('runbooks.title')}</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating((value) => !value)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          {t('action.newRunbook')}
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="rounded-md border border-slate-200 bg-white">
          <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_180px]">
            <label className="relative">
              <span className="sr-only">{t('runbooks.search')}</span>
              <Search aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                className="h-10 w-full rounded-md border border-slate-200 px-9 text-sm outline-none focus:border-slate-400"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('runbooks.searchPlaceholder')}
              />
            </label>
            <select
              className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">{t('runbooks.allCategories')}</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <ul className="divide-y divide-slate-100">
            {filteredRunbooks.map((runbook) => (
              <li key={runbook.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(runbook.id)
                    setIsCreating(false)
                  }}
                  className={[
                    'w-full px-4 py-3 text-left hover:bg-slate-50',
                    selectedRunbook?.id === runbook.id && !isCreating ? 'bg-slate-50' : '',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-950">{runbook.title}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {runbook.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {runbook.serviceName} / {runbook.owner}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-md border border-slate-200 bg-white">
          {isCreating ? (
            <form
              className="space-y-4 p-4"
              onSubmit={(event) => {
                event.preventDefault()

                if (!canCreate) {
                  return
                }

                createRunbookMutation.mutate(
                  {
                    title,
                    serviceName,
                    owner,
                    category: newCategory,
                    triggerKeywords: keywords
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                    steps: steps
                      .split('\n')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  },
                  {
                    onSuccess: (runbook) => {
                      setSelectedId(runbook.id)
                      setIsCreating(false)
                      setTitle('')
                      setServiceName('')
                      setKeywords('')
                      setSteps('')
                    },
                  },
                )
              }}
            >
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <BookOpenCheck aria-hidden="true" className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-950">{t('runbooks.create')}</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">{t('common.title')}</span>
                  <input
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </label>
                <label>
                  <span className="text-sm font-medium text-slate-700">{t('common.service')}</span>
                  <input
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                    value={serviceName}
                    onChange={(event) => setServiceName(event.target.value)}
                  />
                </label>
                <label>
                  <span className="text-sm font-medium text-slate-700">{t('common.owner')}</span>
                  <input
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                    value={owner}
                    onChange={(event) => setOwner(event.target.value)}
                  />
                </label>
                <label>
                  <span className="text-sm font-medium text-slate-700">{t('runbooks.category')}</span>
                  <input
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                    value={newCategory}
                    onChange={(event) => setNewCategory(event.target.value)}
                  />
                </label>
                <label>
                  <span className="text-sm font-medium text-slate-700">{t('runbooks.triggerKeywords')}</span>
                  <input
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                    value={keywords}
                    onChange={(event) => setKeywords(event.target.value)}
                    placeholder="502, timeout, retry"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">{t('runbooks.steps')}</span>
                  <textarea
                    className="mt-1 min-h-40 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={steps}
                    onChange={(event) => setSteps(event.target.value)}
                    placeholder={t('runbooks.stepsPlaceholder')}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={!canCreate || createRunbookMutation.isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                {t('action.saveRunbook')}
              </button>
            </form>
          ) : selectedRunbook ? (
            <div className="space-y-5 p-4">
              <div className="border-b border-slate-200 pb-4">
                <p className="text-sm font-medium text-slate-500">
                  {selectedRunbook.serviceName} / {selectedRunbook.category}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950">{selectedRunbook.title}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {t('runbooks.ownedBy', {
                    owner: selectedRunbook.owner,
                    date: formatDate(selectedRunbook.updatedAt),
                  })}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-950">{t('runbooks.triggerKeywords')}</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedRunbook.triggerKeywords.map((keyword) => (
                    <span key={keyword} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-950">{t('runbooks.checklist')}</h4>
                <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-600">
                  {selectedRunbook.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-950">{t('runbooks.linkedIncidents')}</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedRunbook.linkedIncidentIds.length > 0 ? (
                    selectedRunbook.linkedIncidentIds.map((incidentId) => (
                      <Link
                        key={incidentId}
                        to={`/incidents/${incidentId}`}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        #{incidentId}
                      </Link>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">{t('runbooks.noLinked')}</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-sm text-slate-500">{t('runbooks.noneSelected')}</div>
          )}
        </section>
      </div>
    </div>
  )
}
