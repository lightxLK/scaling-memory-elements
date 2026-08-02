import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Signature from './index'

describe('Signature', () => {
  it('mounts without throwing', () => {
    const { container } = render(<Signature text="Test Name" />)
    expect(container.firstChild).not.toBeNull()
  })
})
