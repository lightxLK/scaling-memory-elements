import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('boom')
  return <div>ok</div>
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary slug="test-slug" onRetry={() => {}}>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    )
    expect(screen.getByText('ok')).toBeInTheDocument()
  })

  it('shows a crash message with the slug and error text on throw, and calls onRetry when clicked', () => {
    const onRetry = vi.fn()
    render(
      <ErrorBoundary slug="test-slug" onRetry={onRetry}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText(/SPECIMEN FAILED — test-slug/i)).toBeInTheDocument()
    expect(screen.getByText(/boom/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
