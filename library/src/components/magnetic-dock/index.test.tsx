import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MagneticDock from './index'

const items = [
  { id: 'finder', label: 'Finder', icon: '📁' },
  { id: 'mail', label: 'Mail', icon: '✉️' },
]

describe('MagneticDock', () => {
  it('mounts without throwing', () => {
    const { container } = render(<MagneticDock items={items} />)
    expect(container.firstChild).not.toBeNull()
  })
})
