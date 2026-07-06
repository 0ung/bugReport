export function AnalysisPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-500">AI analysis</p>
        <h2 className="text-2xl font-semibold text-slate-950">Analysis result</h2>
      </div>
      <section className="rounded-md border border-slate-200 bg-white p-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-950">Summary</h3>
            <p className="mt-2 text-sm text-slate-600">
              Payment API failures look related to upstream timeout and external PG response
              latency.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-950">Check steps</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-slate-600">
              <li>Review Nginx upstream response time.</li>
              <li>Check external PG call failures.</li>
              <li>Inspect WAS thread pool usage.</li>
            </ol>
          </div>
          <div className="rounded-md border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-950">Recommended actions</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
              <li>Confirm PG provider status.</li>
              <li>Inspect retry queue depth.</li>
              <li>Prepare failed payment reprocessing.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
