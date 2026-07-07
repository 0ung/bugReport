import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { AppProviders } from './AppProviders'

const ok = (data: unknown) =>
  new Response(
    JSON.stringify({
      success: true,
      data,
      message: 'OK',
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    },
  )

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = input.toString()

        if (url.endsWith('/dashboard')) {
          return Promise.resolve(
            ok({
              summary: {
                total: 1,
                open: 1,
                highRisk: 1,
                analyzed: 0,
                resolved: 0,
              },
              severityStats: [{ severity: 'HIGH', count: 1 }],
              topKeywords: [{ keyword: '502', count: 1 }],
              recentIncidents: [],
            }),
          )
        }

        if (url.endsWith('/incidents')) {
          return Promise.resolve(ok([]))
        }

        return Promise.resolve(ok([]))
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the OpsPilot dashboard shell', async () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(await screen.findByText('Incident response dashboard')).toBeInTheDocument()
    expect(screen.getByText('Runbook Assistant')).toBeInTheDocument()
  })

  it('switches the shell and dashboard copy between English and Korean', async () => {
    const user = userEvent.setup()

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(await screen.findByText('Incident response dashboard')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'KO' })[0])

    expect(await screen.findByText('장애 대응 대시보드')).toBeInTheDocument()
    expect(screen.getByText('런북 어시스턴트')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'EN' })[0])

    expect(await screen.findByText('Incident response dashboard')).toBeInTheDocument()
    expect(screen.getByText('Runbook Assistant')).toBeInTheDocument()
  })
})
