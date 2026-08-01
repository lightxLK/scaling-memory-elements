import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import FlightStatusCardAdaptive from './index'

describe('FlightStatusCardAdaptive', () => {
  it('mounts without throwing', () => {
    const { container } = render(<FlightStatusCardAdaptive />)
    expect(container.firstChild).not.toBeNull()
  })
})
