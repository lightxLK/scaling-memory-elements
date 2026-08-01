import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PreviewStage } from './PreviewStage'

describe('PreviewStage', () => {
  it('applies default min-height and overflow-hidden when not scrollable', () => {
    const { container } = render(
      <PreviewStage>
        <div>content</div>
      </PreviewStage>
    )
    const stage = container.firstChild as HTMLElement
    expect(stage.style.minHeight).toBe('650px')
    expect(stage.className).toContain('overflow-hidden')
  })

  it('switches to a scrollable track when scrollable is true', () => {
    const { container } = render(
      <PreviewStage scrollable previewHeight={900}>
        <div>content</div>
      </PreviewStage>
    )
    const stage = container.firstChild as HTMLElement
    expect(stage.style.minHeight).toBe('900px')
    expect(stage.className).toContain('overflow-y-auto')
  })
})
