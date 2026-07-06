import {
  Activity,
  BookOpenText,
  ChartNoAxesCombined,
  FileSearch,
  Plus,
} from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: ChartNoAxesCombined },
  { to: '/incidents', label: 'Incidents', icon: Activity },
  { to: '/runbooks', label: 'Runbooks', icon: BookOpenText },
  { to: '/analysis', label: 'Analysis', icon: FileSearch },
]

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            OpsPilot
          </p>
          <h1 className="mt-1 text-lg font-semibold text-slate-950">
            Runbook Assistant
          </h1>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                ].join(' ')
              }
            >
              <item.icon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-3 bottom-4">
          <NavLink
            to="/incidents/new"
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            New incident
          </NavLink>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">OpsPilot</span>
            <nav className="flex gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'rounded-md p-2',
                      isActive ? 'bg-slate-950 text-white' : 'text-slate-600',
                    ].join(' ')
                  }
                  aria-label={item.label}
                >
                  <item.icon aria-hidden="true" className="h-4 w-4" />
                </NavLink>
              ))}
              <NavLink
                to="/incidents/new"
                className="rounded-md bg-slate-950 p-2 text-white"
                aria-label="New incident"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
              </NavLink>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
