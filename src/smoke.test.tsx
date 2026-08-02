import { render, waitFor, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Suspense } from 'react'
import { ErrorBoundary } from '@/components-lib/ErrorBoundary'
import { getCatalog } from '@/catalog'

describe('smoke: every runnable catalog entry mounts without crashing', () => {
  const entries = getCatalog()
  for (const entry of entries) {
    if (!entry.runnable || !entry.Component) {
      it.skip(`${entry.slug} (not runnable / no Component)`, () => {})
      continue
    }
    it(entry.slug, async () => {
      const Component = entry.Component!
      render(
        <ErrorBoundary slug={entry.slug} onRetry={() => {}}>
          <Suspense fallback={<div>loading</div>}>
            <Component />
          </Suspense>
        </ErrorBoundary>
      )
      await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument(), { timeout: 5000 })
      const crashed = screen.queryByText(/Component crashed/i)
      expect(crashed, crashed ? crashed.parentElement?.textContent : '').toBeNull()
    })
  }
})
