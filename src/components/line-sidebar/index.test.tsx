import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LineSidebar from './index'

describe('LineSidebar', () => {
  it('mounts without throwing', () => {
    const { container } = render(<LineSidebar />)
    expect(container.firstChild).not.toBeNull()
  })
})
