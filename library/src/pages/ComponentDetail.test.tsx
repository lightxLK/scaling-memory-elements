import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ComponentDetail } from './ComponentDetail'
import { lazy } from 'react'
import type { CatalogEntry } from '@/catalog'

const FakeComponent = () => <div>fake rendered content</div>

function makeEntry(overrides: Partial<CatalogEntry> = {}): CatalogEntry {
  return {
    slug: 'fake-one', name: 'Fake One', description: 'desc', category: 'Cards',
    tags: [], family: 'misc', deps: [], runnable: true,
    Component: lazy(() => Promise.resolve({ default: FakeComponent })),
    getSource: async () => 'export default function FakeOne() { return null }',
    ...overrides,
  }
}

describe('ComponentDetail', () => {
  it('renders the live component and its source', async () => {
    const entry = makeEntry()
    render(<ComponentDetail entry={entry} />)
    await waitFor(() => expect(screen.getByText('fake rendered content')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /view source/i }))
    await waitFor(() => expect(screen.getByText(/export default function FakeOne/)).toBeInTheDocument())
  })

  it('only fetches source once across repeated toggles', async () => {
    const getSource = vi.fn().mockResolvedValue('const x = 1')
    const entry = makeEntry({ getSource })
    render(<ComponentDetail entry={entry} />)
    await waitFor(() => expect(screen.getByText('fake rendered content')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /view source/i })) // open
    await waitFor(() => expect(screen.getByText(/const x = 1/)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /hide source/i })) // close
    fireEvent.click(screen.getByRole('button', { name: /view source/i })) // open again
    await waitFor(() => expect(screen.getByText(/const x = 1/)).toBeInTheDocument())
    expect(getSource).toHaveBeenCalledTimes(1)
  })

  it('shows a reference-only note instead of attempting to render when not runnable', () => {
    const entry = makeEntry({ slug: 'fake-two', name: 'Fake Two', runnable: false, Component: null, notes: 'source not captured' })
    render(<ComponentDetail entry={entry} />)
    expect(screen.getByText(/source not captured/i)).toBeInTheDocument()
    expect(screen.queryByText('fake rendered content')).not.toBeInTheDocument()
  })

  it('remounts the component when Restart is clicked', async () => {
    const spy = vi.fn()
    const Spied = () => { spy(); return <div>fake rendered content</div> }
    const entry = makeEntry({ Component: lazy(() => Promise.resolve({ default: Spied })) })
    render(<ComponentDetail entry={entry} />)
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole('button', { name: /restart/i }))
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2))
  })

  it('remounts (recovering from a crash) when ErrorBoundary Retry is clicked', async () => {
    let shouldThrow = true
    const Flaky = () => {
      if (shouldThrow) throw new Error('boom')
      return <div>recovered</div>
    }
    const entry = makeEntry({ Component: lazy(() => Promise.resolve({ default: Flaky })) })
    render(<ComponentDetail entry={entry} />)
    await waitFor(() => expect(screen.getByText(/Component crashed/i)).toBeInTheDocument())
    shouldThrow = false
    fireEvent.click(screen.getByRole('button', { name: /retry/i }))
    await waitFor(() => expect(screen.getByText('recovered')).toBeInTheDocument())
  })
})
