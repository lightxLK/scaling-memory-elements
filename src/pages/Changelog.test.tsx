import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Changelog } from './Changelog'

describe('Changelog', () => {
  it('renders the page heading and at least one dated release from CHANGELOG.md', () => {
    render(
      <MemoryRouter>
        <Changelog />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: 'Changelog' })).toBeInTheDocument()
    expect(screen.getByText('v0.1.0')).toBeInTheDocument()
    expect(screen.getByText('2026-08-01')).toBeInTheDocument()
  })
})
