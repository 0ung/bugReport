const runbooks = [
  'Nginx 502 Bad Gateway response procedure',
  'External SaaS timeout retry checklist',
  'DB connection pool exhaustion checklist',
]

export function RunbookPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-500">Runbook library</p>
        <h2 className="text-2xl font-semibold text-slate-950">Runbooks</h2>
      </div>
      <section className="rounded-md border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {runbooks.map((runbook) => (
            <li key={runbook} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-sm font-medium text-slate-900">{runbook}</span>
              <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                Open
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
