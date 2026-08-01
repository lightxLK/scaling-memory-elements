import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EyeTracking from './index'

describe('EyeTracking', () => {
  it('mounts without throwing', () => {
    const { container } = render(<EyeTracking />)
    expect(container.firstChild).not.toBeNull()
  })
})
