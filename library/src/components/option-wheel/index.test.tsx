import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import OptionWheel from './index'

describe('OptionWheel', () => {
  it('mounts without throwing', () => {
    const { container } = render(<OptionWheel />)
    expect(container.firstChild).not.toBeNull()
  })
})
