import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Home } from './Home'
import type { CatalogEntry } from '@/catalog'

const entries: CatalogEntry[] = [
  { slug: 'profile-card', name: 'Profile Card', description: 'tilting card', category: 'Cards', tags: ['tilt'], family: 'react-bits', deps: [], runnable: true, Component: null, getSource: async () => '' },
  { slug: 'hover-image-reveal', name: 'Hover Image Reveal', description: 'reveals images', category: 'Hover', tags: ['hover'], family: 'misc', deps: [], runnable: true, Component: null, getSource: async () => '' },
]

describe('Home', () => {
  it('renders a card per catalog entry, alphabetically', () => {
    render(<MemoryRouter><Home entries={entries} /></MemoryRouter>)
    const names = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent)
    expect(names).toEqual(['Hover Image Reveal', 'Profile Card'])
  })

  it('filters by search text', () => {
    render(<MemoryRouter><Home entries={entries} /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'tilt' } })
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
    expect(screen.getByText('Profile Card')).toBeInTheDocument()
  })

  it('filters by category', () => {
    render(<MemoryRouter><Home entries={entries} /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Hover' } })
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
    expect(screen.getByText('Hover Image Reveal')).toBeInTheDocument()
  })
})
