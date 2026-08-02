import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProfileCard from './index'

describe('ProfileCard', () => {
  it('mounts without throwing', () => {
    const { container } = render(<ProfileCard avatarUrl="/test-avatar.jpg" name="Test" />)
    expect(container.firstChild).not.toBeNull()
  })
})
