import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CursorDrivenParticleTypography from './index'

describe('CursorDrivenParticleTypography', () => {
  it('mounts without throwing', () => {
    const { container } = render(<CursorDrivenParticleTypography text="Hello" />)
    expect(container.firstChild).not.toBeNull()
  })
})
