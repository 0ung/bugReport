import {
  Activity,
  BookOpenText,
  ChartNoAxesCombined,
  FileSearch,
  Plus,
} from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'
import { useLanguage, type Language, type TranslationKey } from '../i18n/language'

const navItems = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: ChartNoAxesCombined },
  { to: '/incidents', labelKey: 'nav.incidents', icon: Activity },
  { to: '/runbooks', labelKey: 'nav.runbooks', icon: BookOpenText },
  { to: '/analysis', labelKey: 'nav.analysis', icon: FileSearch },
] satisfies Array<{
  to: string
  labelKey: TranslationKey
  icon: typeof ChartNoAxesCombined
}>

const languageOptions: Array<{ value: Language; label: string }> = [
  { value: 'ko', label: 'KO' },
  { value: 'en', label: 'EN' },
]

export function AppShell({ children }: PropsWithChildren) {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            OpsPilot
          </p>
          <h1 className="mt-1 text-lg font-semibold text-slate-950">
            {t('app.subtitle')}
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
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-3 bottom-4">
          <div className="mb-3 grid grid-cols-2 rounded-md border border-slate-200 bg-slate-100 p-1">
            {languageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLanguage(option.value)}
                className={[
                  'h-8 rounded px-2 text-xs font-semibold transition',
                  language === option.value
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900',
                ].join(' ')}
              >
                {option.label}
              </button>
            ))}
          </div>
          <NavLink
            to="/incidents/new"
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            {t('action.newIncident')}
          </NavLink>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">OpsPilot</span>
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-2 rounded-md border border-slate-200 bg-slate-100 p-0.5">
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLanguage(option.value)}
                    className={[
                      'h-8 rounded px-2 text-xs font-semibold',
                      language === option.value ? 'bg-white text-slate-950' : 'text-slate-500',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
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
                  aria-label={t(item.labelKey)}
                >
                  <item.icon aria-hidden="true" className="h-4 w-4" />
                </NavLink>
              ))}
              <NavLink
                to="/incidents/new"
                className="rounded-md bg-slate-950 p-2 text-white"
                aria-label={t('action.newIncident')}
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
              </NavLink>
              </nav>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
