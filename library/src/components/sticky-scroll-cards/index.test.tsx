import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StickyScrollCards from './index'

const items = [
  { title: 'One', src: '/fixtures/one.jpg' },
  { title: 'Two', src: '/fixtures/two.jpg' },
  { title: 'Three', src: '/fixtures/three.jpg' },
]

describe('StickyScrollCards', () => {
  it('mounts without throwing', () => {
    const { container } = render(<StickyScrollCards cards={items} />)
    expect(container.firstChild).not.toBeNull()
  })
})
