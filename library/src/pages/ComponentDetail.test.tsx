import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ComponentDetail } from './ComponentDetail'
import { lazy } from 'react'
import type { CatalogEntry } from '@/catalog'

const FakeComponent = () => <div>fake rendered content</div>

// The code block tokenizes each line into multiple syntax-highlighted spans,
// so source text can no longer be matched against a single text node.
function expectCodeToContain(text: string) {
  const code = document.querySelector('code')
  expect(code?.textContent).toContain(text)
}

function makeEntry(overrides: Partial<CatalogEntry> = {}): CatalogEntry {
  return {
    slug: 'fake-one', name: 'Fake One', description: 'desc', category: 'Cards',
    tags: [], family: 'misc', deps: [], runnable: true,
    Component: lazy(() => Promise.resolve({ default: FakeComponent })),
    getSource: async () => 'export default function FakeOne() { return null }',
    ...overrides,
  }
}

function renderDetail(entry: CatalogEntry) {
  return render(
    <MemoryRouter>
      <ComponentDetail entry={entry} />
    </MemoryRouter>
  )
}

describe('ComponentDetail', () => {
  it('renders the live component and its source', async () => {
    const entry = makeEntry()
    renderDetail(entry)
    await waitFor(() => expect(screen.getByText('fake rendered content')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /^source$/i }))
    await waitFor(() => expectCodeToContain('export default function FakeOne'))
  })

  it('only fetches source once across repeated tab switches', async () => {
    const getSource = vi.fn().mockResolvedValue('const x = 1')
    const entry = makeEntry({ getSource })
    renderDetail(entry)
    await waitFor(() => expect(screen.getByText('fake rendered content')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /^source$/i })) // switch to source tab
    await waitFor(() => expectCodeToContain('const x = 1'))
    fireEvent.click(screen.getByRole('button', { name: /^preview$/i })) // switch back
    fireEvent.click(screen.getByRole('button', { name: /^source$/i })) // switch again
    await waitFor(() => expectCodeToContain('const x = 1'))
    expect(getSource).toHaveBeenCalledTimes(1)
  })

  it('shows a reference-only note instead of attempting to render when not runnable', () => {
    const entry = makeEntry({ slug: 'fake-two', name: 'Fake Two', runnable: false, Component: null, notes: 'source not captured' })
    renderDetail(entry)
    expect(screen.getByText(/source not captured/i)).toBeInTheDocument()
    expect(screen.queryByText('fake rendered content')).not.toBeInTheDocument()
  })

  it('remounts the component when Restart is clicked', async () => {
    const spy = vi.fn()
    const Spied = () => { spy(); return <div>fake rendered content</div> }
    const entry = makeEntry({ Component: lazy(() => Promise.resolve({ default: Spied })) })
    renderDetail(entry)
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
    renderDetail(entry)
    await waitFor(() => expect(screen.getByText(/SPECIMEN FAILED/i)).toBeInTheDocument())
    shouldThrow = false
    fireEvent.click(screen.getByRole('button', { name: /retry/i }))
    await waitFor(() => expect(screen.getByText('recovered')).toBeInTheDocument())
  })
})
