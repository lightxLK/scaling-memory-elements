import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CollectionSurfer from './index'

describe('CollectionSurfer', () => {
  it('mounts without throwing', () => {
    const { container } = render(<CollectionSurfer />)
    expect(container.firstChild).not.toBeNull()
  })
})
