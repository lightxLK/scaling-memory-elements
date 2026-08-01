import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HoverImageReveal from './index'

describe('HoverImageReveal', () => {
  it('mounts without throwing', () => {
    const { container } = render(<HoverImageReveal />)
    expect(container.firstChild).not.toBeNull()
  })
})
