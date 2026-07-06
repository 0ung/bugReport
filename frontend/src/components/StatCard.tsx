import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  label: string
  value: string | number
  helper: string
  icon: LucideIcon
}

export function StatCard({ label, value, helper, icon: Icon }: StatCardProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <div className="rounded-md bg-slate-100 p-2 text-slate-600">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{helper}</p>
    </section>
  )
}
