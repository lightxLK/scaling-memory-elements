import { useState } from 'react'
import { Link } from 'react-router-dom'
import { filterCatalog, type CatalogEntry } from '@/catalog'
import type { Category } from '@/types'

const CATEGORIES: (Category | 'All')[] = [
  'All', 'Hover', 'Cards', 'Navigation', 'Scrolling', 'Typography', 'Cursor', 'Motion', '3D', 'Toggle', 'Showcase',
]

export function Home({ entries }: { entries: CatalogEntry[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category | 'All'>('All')

  // Sorted here even though getCatalog() already returns alphabetical order —
  // Home takes entries as a plain prop specifically so it doesn't depend on
  // that upstream guarantee (matches the isolation goal from the design doc:
  // a unit's correctness shouldn't rely on an assumption about its caller).
  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name))
  const filtered = filterCatalog(sorted, {
    search: search || undefined,
    category: category === 'All' ? undefined : category,
  })

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
        <input
          placeholder="Search components…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <label htmlFor="category-filter" className="sr-only">
          Category
        </label>
        <select
          id="category-filter"
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | 'All')}
          className="border rounded px-3 py-2"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((entry) => (
          <Link
            key={entry.slug}
            to={entry.family === 'full-page' ? `/showcase/${entry.slug}` : `/component/${entry.slug}`}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold">{entry.name}</h3>
            <p className="text-sm text-neutral-500 mt-1">{entry.description}</p>
            <div className="flex gap-2 mt-2 text-xs text-neutral-400">
              <span>{entry.category}</span>
              <span>·</span>
              <span>{entry.family}</span>
              {!entry.runnable && <span>· reference only</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
