import { render, screen } from '@testing-library/react'
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
})
