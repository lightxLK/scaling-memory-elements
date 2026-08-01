import { describe, it, expect } from 'vitest'
import { filterCatalog, type CatalogEntry } from './catalog'

const fixture: CatalogEntry[] = [
  { slug: 'a', name: 'Alpha Card', description: 'a card', category: 'Cards', tags: ['card'], family: 'misc', deps: [], runnable: true, Component: null, getSource: async () => '' },
  { slug: 'b', name: 'Beta Hover', description: 'hovers', category: 'Hover', tags: ['hover'], family: 'misc', deps: [], runnable: true, Component: null, getSource: async () => '' },
]

describe('filterCatalog', () => {
  it('matches search against name, slug, tags, and description', () => {
    expect(filterCatalog(fixture, { search: 'hover' })).toHaveLength(1)
    expect(filterCatalog(fixture, { search: 'a-card-tag-miss' })).toHaveLength(0)
    expect(filterCatalog(fixture, { search: 'alpha' })).toHaveLength(1)
  })

  it('filters by category', () => {
    expect(filterCatalog(fixture, { category: 'Cards' })).toHaveLength(1)
  })

  it('returns all entries with no query', () => {
    expect(filterCatalog(fixture, {})).toHaveLength(2)
  })
})
