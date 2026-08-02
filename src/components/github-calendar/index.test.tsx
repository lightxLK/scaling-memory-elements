import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import GithubCalendar from './index'

describe('GithubCalendar', () => {
  it('mounts without throwing', () => {
    const { container } = render(<GithubCalendar username="test-user" />)
    expect(container.firstChild).not.toBeNull()
  })
})
