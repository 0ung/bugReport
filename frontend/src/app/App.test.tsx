import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { AppProviders } from './AppProviders'

describe('App', () => {
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
