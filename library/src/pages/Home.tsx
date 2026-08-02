import { useState } from 'react'
import { Link } from 'react-router-dom'
import { filterCatalog, type CatalogEntry } from '@/catalog'
import type { Category } from '@/types'
import { CATEGORY_COLOR } from '@/lib/categoryColor'

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
    <div className="mx-auto max-w-[1400px] px-6 pb-24 pt-12 sm:px-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          A working index of interaction components.
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
          Every specimen below is live, running source — hover, drag, and scroll it before you take it apart.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-4 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative flex-1 sm:max-w-xs">
          <span className="sr-only">Search components</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            fill="none"
          >
            <circle cx="6.5" cy="6.5" r="4.75" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10 10.5L14 14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            placeholder="Search specimens…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-0 bg-transparent py-1 pl-6 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </label>

        <div role="group" aria-label="Filter by category" className="-mx-1 flex flex-wrap gap-1.5 overflow-x-auto px-1">
          {CATEGORIES.map((c) => {
            const active = category === c
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[0.68rem] tracking-[0.08em] transition-colors ${
                  active
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                }`}
              >
                {c.toUpperCase()}
              </button>
            )
          })}
        </div>
      </div>

      <p className="mt-4 font-mono text-[0.68rem] tracking-[0.1em] text-muted-foreground">
        {String(filtered.length).padStart(2, '0')} / {String(entries.length).padStart(2, '0')} SHOWN
      </p>

      <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((entry, i) => (
          <Link
            key={entry.slug}
            to={entry.family === 'full-page' ? `/showcase/${entry.slug}` : `/component/${entry.slug}`}
            className="group relative flex flex-col gap-3 bg-background p-5 transition-colors hover:bg-muted"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-mono text-[0.68rem] tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
              {!entry.runnable && (
                <span className="font-mono text-[0.62rem] tracking-[0.06em] text-muted-foreground">REF ONLY</span>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-foreground transition-colors group-hover:text-accent">
                {entry.name}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
            </div>

            <div className="mt-auto flex items-center gap-2 pt-1 font-mono text-[0.65rem] tracking-[0.06em] text-muted-foreground">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLOR[entry.category] }}
              />
              <span>{entry.category.toUpperCase()}</span>
              <span className="text-border">/</span>
              <span>{entry.family}</span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center font-mono text-sm text-muted-foreground">No specimens match that search.</p>
      )}
    </div>
  )
}
