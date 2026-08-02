import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import type { CatalogEntry } from '@/catalog'

const entries: CatalogEntry[] = [
  { slug: 'profile-card', name: 'Profile Card', description: 'd', category: 'Cards', tags: [], family: 'react-bits', deps: [], runnable: true, Component: null, getSource: async () => '' },
  { slug: 'koisei-landing', name: 'Koisei', description: 'd', category: 'Showcase', tags: [], family: 'full-page', deps: [], runnable: true, Component: null, getSource: async () => '' },
]

describe('AppRoutes', () => {
  it('renders Home at /', () => {
    render(<MemoryRouter initialEntries={['/']}><AppRoutes entries={entries} /></MemoryRouter>)
    expect(screen.getByText('Profile Card')).toBeInTheDocument()
  })

  it('renders ComponentDetail at /component/:slug', () => {
    render(<MemoryRouter initialEntries={['/component/profile-card']}><AppRoutes entries={entries} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Profile Card' })).toBeInTheDocument()
  })

  it('renders FullPageShowcase at /showcase/:slug', () => {
    render(<MemoryRouter initialEntries={['/showcase/koisei-landing']}><AppRoutes entries={entries} /></MemoryRouter>)
    expect(screen.getByTitle('Koisei')).toBeInTheDocument()
  })
})
