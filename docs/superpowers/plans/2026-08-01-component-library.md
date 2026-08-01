# Component Library & Browsable Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn 16 scraped `v*.txt` snippet files into a named, organized component library (`library/src/components/<slug>/`) with a live-preview Vite/React gallery for browsing them.

**Architecture:** A Vite + React + TypeScript + Tailwind SPA. `catalog.ts` auto-discovers every component folder via `import.meta.glob` (no manual registry to maintain). Each component lives in its own folder with `index.tsx` (+ optional `.css`) and `meta.ts`. A home grid lists/filters/searches entries; a detail route lazy-loads and renders the live component inside a shared `PreviewStage`, wrapped in an `ErrorBoundary`, with a source-code panel. One entry (`koisei-landing`) is a full standalone HTML page shown via iframe instead of a React import.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, react-router-dom, styled-components, framer-motion, clsx, tailwind-merge, lucide-react, three, opentype.js, lenis, Vitest + @testing-library/react + jsdom (dev/test only).

## Global Constraints

- Package manager: npm (per spec).
- Path alias `@` resolves to `library/src` in both `vite.config.ts` and `tsconfig.json` — this is what lets the Componentry-family files' existing `@/lib/utils` imports work unmodified.
- Every component folder needs a `meta.ts` conforming to the `ComponentMeta` interface (Task 2) and, unless it's the `full-page` family, an `index.tsx` with a **default export** — if the original snippet only has named exports, add one `export default <Name>;` line during porting.
- Category values are restricted to the fixed enum: `Hover | Cards | Navigation | Scrolling | Typography | Cursor | Motion | 3D | Toggle | Showcase`.
- Original `v*.txt` files (and `effect names.txt`) are deleted only in the final task (Task 25), after every component is verified ported — never delete a source file in the same task that reads from it.
- No ESLint/hydration checks (not in scope, no SSR) — see spec's Verification section for the exact intended checks.

---

### Task 1: Scaffold the Vite gallery app

**Files:**
- Create: `library/package.json`, `library/vite.config.ts`, `library/tsconfig.json`, `library/tsconfig.node.json`, `library/tailwind.config.ts`, `library/postcss.config.js`, `library/index.html`, `library/src/main.tsx`, `library/src/App.tsx`, `library/src/index.css`
- Test: `library/src/App.test.tsx`

**Interfaces:**
- Produces: a running Vite React-TS app at `library/`, with `npm run dev`, `npm run build`, `npm run test` scripts, Tailwind wired through `index.css`, and alias `@` → `src`.

- [ ] **Step 1: Scaffold with Vite**

```bash
cd "C:\Users\Lokesh Patra\Documents\Projects\Designs\portfolio\Components"
npm create vite@latest library -- --template react-ts
cd library
npm install
```

- [ ] **Step 2: Install runtime + dev dependencies**

```bash
npm install react-router-dom styled-components framer-motion clsx tailwind-merge lucide-react three opentype.js lenis
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom @types/three @types/styled-components
npx tailwindcss init -p
```

- [ ] **Step 3: Configure the `@` alias**

Edit `library/vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

Edit `library/tsconfig.json` `compilerOptions` to add:

```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

- [ ] **Step 4: Configure Tailwind**

`library/tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
```

`library/src/index.css` (replace default Vite CSS):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Add test script and a smoke test**

Edit `library/package.json` scripts to include:

```json
"test": "vitest run"
```

`library/src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })
})
```

Minimal `library/src/App.tsx` for now (real routing comes in Task 8):

```tsx
export default function App() {
  return <div>Component Library</div>
}
```

- [ ] **Step 6: Run the test suite**

Run: `npm run test` (from `library/`)
Expected: PASS (1 test)

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: succeeds with no errors

- [ ] **Step 8: Commit**

```bash
git add library/
git commit -m "chore: scaffold Vite gallery app with Tailwind, Vitest, and @ alias"
```

---

### Task 2: Shared types, category enum, and `cn()` utility

**Files:**
- Create: `library/src/lib/utils.ts`, `library/src/types.ts`
- Test: `library/src/lib/utils.test.ts`

**Interfaces:**
- Produces: `cn(...classes: (string | undefined | false | null)[]): string` from `@/lib/utils`; `Category` union type and `ComponentMeta` interface from `@/types`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names and drops falsy values', () => {
    expect(cn('a', false, undefined, 'b', null)).toBe('a b')
  })

  it('resolves conflicting tailwind classes to the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- utils` (from `library/`)
Expected: FAIL (`cn` not defined / module not found)

- [ ] **Step 3: Implement `cn()`**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Run `npm install clsx tailwind-merge` if not already present from Task 1 (they are — this just confirms).

- [ ] **Step 4: Define shared types**

`library/src/types.ts`:

```ts
export type Category =
  | 'Hover'
  | 'Cards'
  | 'Navigation'
  | 'Scrolling'
  | 'Typography'
  | 'Cursor'
  | 'Motion'
  | '3D'
  | 'Toggle'
  | 'Showcase'

export type Family = 'react-bits' | 'componentry' | 'misc' | 'full-page'

export interface ComponentMeta {
  slug: string
  name: string
  description: string
  category: Category
  tags: string[]
  family: Family
  deps: string[]
  runnable: boolean
  previewHeight?: number
  background?: 'light' | 'dark' | 'transparent'
  scrollable?: boolean
  notes?: string
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test -- utils`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add library/src/lib/utils.ts library/src/types.ts library/src/lib/utils.test.ts
git commit -m "feat: add cn() utility and shared ComponentMeta/Category types"
```

---

### Task 3: `ErrorBoundary` component with crash message and Retry

**Files:**
- Create: `library/src/components-lib/ErrorBoundary.tsx`
- Test: `library/src/components-lib/ErrorBoundary.test.tsx`

(Note: shared gallery UI pieces live under `src/components-lib/`, distinct from the ported design components under `src/components/<slug>/`, so the glob patterns in Task 5 never pick up gallery infrastructure by accident.)

**Interfaces:**
- Produces: `<ErrorBoundary slug={string}>{children}</ErrorBoundary>` — catches render/lifecycle errors from `children`, shows a fallback with the error message and a Retry button; clicking Retry remounts `children`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('boom')
  return <div>ok</div>
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary slug="test-slug">
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    )
    expect(screen.getByText('ok')).toBeInTheDocument()
  })

  it('shows a crash message with the slug and error text on throw', () => {
    render(
      <ErrorBoundary slug="test-slug">
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText(/Component crashed: test-slug/i)).toBeInTheDocument()
    expect(screen.getByText(/boom/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- ErrorBoundary`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `ErrorBoundary`**

```tsx
import { Component, type ReactNode } from 'react'

interface Props {
  slug: string
  children: ReactNode
}

interface State {
  error: Error | null
  retryKey: number
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, retryKey: 0 }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  handleRetry = () => {
    this.setState((prev) => ({ error: null, retryKey: prev.retryKey + 1 }))
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert" className="p-6 text-center">
          <p className="font-semibold">Component crashed: {this.props.slug}</p>
          <p className="text-sm text-red-500 mt-1">{this.state.error.message}</p>
          <button
            onClick={this.handleRetry}
            className="mt-3 px-3 py-1 rounded bg-neutral-800 text-white"
          >
            Retry
          </button>
        </div>
      )
    }
    return <div key={this.state.retryKey}>{this.props.children}</div>
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- ErrorBoundary`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add library/src/components-lib/ErrorBoundary.tsx library/src/components-lib/ErrorBoundary.test.tsx
git commit -m "feat: add ErrorBoundary with crash message and retry"
```

---

### Task 4: `PreviewStage` component

**Files:**
- Create: `library/src/components-lib/PreviewStage.tsx`
- Test: `library/src/components-lib/PreviewStage.test.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `<PreviewStage previewHeight?: number; background?: 'light'|'dark'|'transparent'; scrollable?: boolean>{children}</PreviewStage>` — per spec's "Preview Stage" section.

- [ ] **Step 1: Write the failing test**

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PreviewStage } from './PreviewStage'

describe('PreviewStage', () => {
  it('applies default min-height and overflow-hidden when not scrollable', () => {
    const { container } = render(
      <PreviewStage>
        <div>content</div>
      </PreviewStage>
    )
    const stage = container.firstChild as HTMLElement
    expect(stage.style.minHeight).toBe('650px')
    expect(stage.className).toContain('overflow-hidden')
  })

  it('switches to a scrollable track when scrollable is true', () => {
    const { container } = render(
      <PreviewStage scrollable previewHeight={900}>
        <div>content</div>
      </PreviewStage>
    )
    const stage = container.firstChild as HTMLElement
    expect(stage.style.minHeight).toBe('900px')
    expect(stage.className).toContain('overflow-y-auto')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- PreviewStage`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `PreviewStage`**

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  previewHeight?: number
  background?: 'light' | 'dark' | 'transparent'
  scrollable?: boolean
}

export function PreviewStage({ children, previewHeight = 650, background = 'light', scrollable = false }: Props) {
  return (
    <div
      style={{ minHeight: `${previewHeight}px` }}
      className={cn(
        'flex items-center justify-center p-10 rounded-lg',
        scrollable ? 'overflow-y-auto' : 'overflow-hidden',
        background === 'dark' && 'bg-neutral-900 text-white',
        background === 'light' && 'bg-neutral-50',
        background === 'transparent' && 'bg-transparent'
      )}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- PreviewStage`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add library/src/components-lib/PreviewStage.tsx library/src/components-lib/PreviewStage.test.tsx
git commit -m "feat: add PreviewStage with default and scrollable stage variants"
```

---

### Task 5: Catalog module (glob-based manifest)

**Files:**
- Create: `library/src/catalog.ts`, `library/src/catalog.test.ts`

**Interfaces:**
- Consumes: `ComponentMeta` from `@/types` (Task 2).
- Produces:
  - `interface CatalogEntry extends ComponentMeta { Component: React.LazyExoticComponent<React.ComponentType> | null; getSource: () => Promise<string> }`
  - `getCatalog(): CatalogEntry[]` — all entries, alphabetical by `name`.
  - `filterCatalog(entries: CatalogEntry[], query: { search?: string; category?: Category }): CatalogEntry[]` — pure function, used by Home (Task 6).

- [ ] **Step 1: Write the failing test for the pure filter logic**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- catalog`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `catalog.ts`**

```ts
import { lazy } from 'react'
import type { Category, ComponentMeta } from '@/types'

export interface CatalogEntry extends ComponentMeta {
  Component: ReturnType<typeof lazy> | null
  getSource: () => Promise<string>
}

const metaModules = import.meta.glob<{ default: ComponentMeta }>('./components/*/meta.ts', { eager: true })
const componentLoaders = import.meta.glob('./components/*/index.tsx')
const sourceLoaders = import.meta.glob('./components/*/index.tsx', { as: 'raw' })

function folderFromPath(path: string) {
  // "./components/profile-card/meta.ts" -> "profile-card"
  return path.split('/')[2]
}

export function getCatalog(): CatalogEntry[] {
  const entries = Object.entries(metaModules).map(([path, mod]) => {
    const slug = folderFromPath(path)
    const componentPath = `./components/${slug}/index.tsx`
    const loader = componentLoaders[componentPath]
    const sourceLoader = sourceLoaders[componentPath]
    return {
      ...mod.default,
      Component: loader ? lazy(loader as () => Promise<{ default: React.ComponentType }>) : null,
      getSource: async () => (sourceLoader ? ((await sourceLoader()) as string) : ''),
    }
  })
  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

export function filterCatalog(
  entries: CatalogEntry[],
  query: { search?: string; category?: Category }
): CatalogEntry[] {
  return entries.filter((entry) => {
    if (query.category && entry.category !== query.category) return false
    if (query.search) {
      const haystack = [entry.name, entry.slug, entry.description, ...entry.tags].join(' ').toLowerCase()
      if (!haystack.includes(query.search.toLowerCase())) return false
    }
    return true
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- catalog`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add library/src/catalog.ts library/src/catalog.test.ts
git commit -m "feat: add glob-based catalog manifest and pure filterCatalog"
```

---

### Task 6: `Home` page (grid, search, category filter)

**Files:**
- Create: `library/src/pages/Home.tsx`, `library/src/pages/Home.test.tsx`

**Interfaces:**
- Consumes: `CatalogEntry`, `filterCatalog` from `@/catalog` (Task 5).
- Produces: `<Home entries: CatalogEntry[]>` — a pure-props component (real catalog is injected by `App.tsx` in Task 8), so it's testable without touching `import.meta.glob`.

- [ ] **Step 1: Write the failing test**

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- Home`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `Home`**

```tsx
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- Home`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add library/src/pages/Home.tsx library/src/pages/Home.test.tsx
git commit -m "feat: add Home grid page with search and category filter"
```

---

### Task 7: `ComponentDetail` page

**Files:**
- Create: `library/src/pages/ComponentDetail.tsx`, `library/src/pages/ComponentDetail.test.tsx`

**Interfaces:**
- Consumes: `CatalogEntry` (Task 5), `ErrorBoundary` (Task 3), `PreviewStage` (Task 4).
- Produces: `<ComponentDetail entry: CatalogEntry>` — renders the live component (or a reference-only note if `!entry.runnable` or `Component` is `null`), a light/dark stage toggle, a Restart button, and a source panel.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ComponentDetail } from './ComponentDetail'
import { lazy } from 'react'
import type { CatalogEntry } from '@/catalog'

const FakeComponent = () => <div>fake rendered content</div>

const runnableEntry: CatalogEntry = {
  slug: 'fake-one', name: 'Fake One', description: 'desc', category: 'Cards',
  tags: [], family: 'misc', deps: [], runnable: true,
  Component: lazy(() => Promise.resolve({ default: FakeComponent })),
  getSource: async () => 'export default function FakeOne() { return null }',
}

const referenceEntry: CatalogEntry = {
  ...runnableEntry, slug: 'fake-two', name: 'Fake Two', runnable: false, Component: null,
  notes: 'source not captured',
}

describe('ComponentDetail', () => {
  it('renders the live component and its source', async () => {
    render(<ComponentDetail entry={runnableEntry} />)
    await waitFor(() => expect(screen.getByText('fake rendered content')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /view source/i }))
    expect(screen.getByText(/export default function FakeOne/)).toBeInTheDocument()
  })

  it('shows a reference-only note instead of attempting to render when not runnable', () => {
    render(<ComponentDetail entry={referenceEntry} />)
    expect(screen.getByText(/source not captured/i)).toBeInTheDocument()
    expect(screen.queryByText('fake rendered content')).not.toBeInTheDocument()
  })

  it('remounts the component when Restart is clicked', async () => {
    const spy = vi.fn()
    const Spied = () => { spy(); return <div>fake rendered content</div> }
    const entry = { ...runnableEntry, Component: lazy(() => Promise.resolve({ default: Spied })) }
    render(<ComponentDetail entry={entry} />)
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole('button', { name: /restart/i }))
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- ComponentDetail`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `ComponentDetail`**

```tsx
import { Suspense, useState } from 'react'
import { ErrorBoundary } from '@/components-lib/ErrorBoundary'
import { PreviewStage } from '@/components-lib/PreviewStage'
import type { CatalogEntry } from '@/catalog'

export function ComponentDetail({ entry }: { entry: CatalogEntry }) {
  const [restartKey, setRestartKey] = useState(0)
  const [showSource, setShowSource] = useState(false)
  const [source, setSource] = useState('')
  const [stageBg, setStageBg] = useState<'light' | 'dark'>(entry.background === 'dark' ? 'dark' : 'light')

  if (!entry.runnable || !entry.Component) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">{entry.name}</h2>
        <p className="mt-2 text-neutral-600">{entry.notes ?? 'This entry has no runnable source.'}</p>
      </div>
    )
  }

  const Component = entry.Component

  async function toggleSource() {
    if (!showSource) setSource(await entry.getSource())
    setShowSource((v) => !v)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{entry.name}</h2>
        <div className="flex gap-2">
          <button onClick={() => setStageBg((b) => (b === 'light' ? 'dark' : 'light'))} className="px-3 py-1 border rounded">
            Toggle {stageBg === 'light' ? 'dark' : 'light'}
          </button>
          <button onClick={() => setRestartKey((k) => k + 1)} className="px-3 py-1 border rounded">
            Restart
          </button>
          <button onClick={toggleSource} className="px-3 py-1 border rounded">
            {showSource ? 'Hide source' : 'View source'}
          </button>
        </div>
      </div>
      <ErrorBoundary slug={entry.slug} key={restartKey}>
        <Suspense fallback={<div>Loading…</div>}>
          <PreviewStage previewHeight={entry.previewHeight} background={stageBg} scrollable={entry.scrollable}>
            <Component />
          </PreviewStage>
        </Suspense>
      </ErrorBoundary>
      {showSource && (
        <pre className="mt-4 p-4 bg-neutral-900 text-neutral-100 rounded overflow-x-auto text-sm">
          <code>{source}</code>
        </pre>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- ComponentDetail`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add library/src/pages/ComponentDetail.tsx library/src/pages/ComponentDetail.test.tsx
git commit -m "feat: add ComponentDetail page with live preview, restart, and source panel"
```

---

### Task 8: `App.tsx` routing, sidebar nav, and `FullPageShowcase`

**Files:**
- Modify: `library/src/App.tsx`, `library/src/App.test.tsx`
- Create: `library/src/pages/FullPageShowcase.tsx`

**Interfaces:**
- Consumes: `getCatalog()` (Task 5), `Home` (Task 6), `ComponentDetail` (Task 7).
- Produces: routes `/`, `/component/:slug`, `/showcase/:slug`.

- [ ] **Step 1: Write the failing test**

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- App`
Expected: FAIL (`AppRoutes` not exported)

- [ ] **Step 3: Implement `FullPageShowcase`**

```tsx
import type { CatalogEntry } from '@/catalog'

export function FullPageShowcase({ entry }: { entry: CatalogEntry }) {
  return (
    <iframe
      title={entry.name}
      src={`/showcases/${entry.slug}.html`}
      className="w-full h-screen border-0"
    />
  )
}
```

- [ ] **Step 4: Implement routing in `App.tsx`**

```tsx
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import { getCatalog, type CatalogEntry } from '@/catalog'
import { Home } from '@/pages/Home'
import { ComponentDetail } from '@/pages/ComponentDetail'
import { FullPageShowcase } from '@/pages/FullPageShowcase'

function DetailRoute({ entries }: { entries: CatalogEntry[] }) {
  const { slug } = useParams()
  const entry = entries.find((e) => e.slug === slug)
  if (!entry) return <div className="p-6">Not found</div>
  return <ComponentDetail entry={entry} />
}

function ShowcaseRoute({ entries }: { entries: CatalogEntry[] }) {
  const { slug } = useParams()
  const entry = entries.find((e) => e.slug === slug)
  if (!entry) return <div className="p-6">Not found</div>
  return <FullPageShowcase entry={entry} />
}

export function AppRoutes({ entries }: { entries: CatalogEntry[] }) {
  return (
    <Routes>
      <Route path="/" element={<Home entries={entries} />} />
      <Route path="/component/:slug" element={<DetailRoute entries={entries} />} />
      <Route path="/showcase/:slug" element={<ShowcaseRoute entries={entries} />} />
    </Routes>
  )
}

export default function App() {
  const entries = getCatalog()
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <header className="border-b p-4">
          <Link to="/" className="font-bold text-lg">Component Library</Link>
        </header>
        <AppRoutes entries={entries} />
      </div>
    </BrowserRouter>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test -- App`
Expected: PASS (3 tests)

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: succeeds

- [ ] **Step 7: Commit**

```bash
git add library/src/App.tsx library/src/App.test.tsx library/src/pages/FullPageShowcase.tsx
git commit -m "feat: wire up routing, sidebar link, and full-page showcase route"
```

---

### Task 9: Sanitize and place `koisei-landing.html` (v2)

**Files:**
- Create: `library/public/showcases/koisei-landing.html`, `library/src/components/koisei-landing/meta.ts`

**Interfaces:**
- Produces: a `meta.ts`-only catalog entry with `family: 'full-page'` (no `index.tsx` — `FullPageShowcase` from Task 8 loads the HTML by URL, not by import).

- [ ] **Step 1: Copy and sanitize the HTML**

Copy the full contents of `v2.txt` to `library/public/showcases/koisei-landing.html`, then make exactly two removals:

1. Delete the entire `<script id="aura-preview-performance-controller">` block — from the opening `<script id="aura-preview-performance-controller">` tag (originally line 3 of `v2.txt`) through its matching `</script>` (originally line 92).
2. Delete the Google Analytics block — from `<!-- aura-ga4-start -->` through `<!-- aura-ga4-end -->` (originally lines 115–123 of `v2.txt`), which contains the `googletagmanager.com/gtag/js` script tag and the inline `gtag(...)` calls.

Leave everything else (Tailwind CDN script, fonts, GSAP/ScrollTrigger/Lenis CDN scripts, the page markup, inline styles) untouched.

- [ ] **Step 2: Verify the removals**

Run: `grep -c "gtag\|aura-preview-performance-controller" library/public/showcases/koisei-landing.html`
Expected: `0`

- [ ] **Step 3: Write `meta.ts`**

`library/src/components/koisei-landing/meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'koisei-landing',
  name: 'Koisei — Down the Spring River',
  description: 'Full parallax one-page site: hero, film-scroll gallery, day-to-night dissolve, custom cursor.',
  category: 'Showcase',
  tags: ['parallax', 'gsap', 'three.js', 'lenis', 'full-page'],
  family: 'full-page',
  deps: ['gsap', 'three', 'lenis'],
  runnable: true,
}

export default meta
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev` (from `library/`), navigate to `/showcase/koisei-landing` in a browser via claude-in-chrome, confirm the page renders in the iframe, and use `read_network_requests` to confirm no request to `googletagmanager.com` fires.

- [ ] **Step 5: Commit**

```bash
git add library/public/showcases/koisei-landing.html library/src/components/koisei-landing/meta.ts
git commit -m "feat: add koisei-landing full-page showcase (tracking scripts stripped)"
```

---

### Tasks 10–24: Port each component

Every task below follows the same shape: extract source into `library/src/components/<slug>/`, apply the listed edits, write `meta.ts`, write a smoke test, verify, commit. The smoke test pattern is:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Component from './index'

describe('<Name>', () => {
  it('mounts without throwing', () => {
    const { container } = render(<Component {...FIXTURE_PROPS} />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

Where `FIXTURE_PROPS` is built by reading the Props interface at the top of the file you just created in Step 1 of each task, and supplying the minimum needed to satisfy any required (non-`?`) fields — most of these components make every prop optional with defaults, so `{}` is often sufficient; where an array of items is required, pass one minimal fixture object matching that item's shape.

---

### Task 10: Port `theme-switch` (v1 → `Switch`)

**Files:**
- Create: `library/src/components/theme-switch/index.tsx`, `library/src/components/theme-switch/meta.ts`, `library/src/components/theme-switch/index.test.tsx`

- [ ] **Step 1:** Copy the entire contents of `v1.txt` verbatim to `library/src/components/theme-switch/index.tsx`. No edits needed — it already has `export default Switch;` and only depends on `styled-components` (already installed).

- [ ] **Step 2:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'theme-switch',
  name: 'Theme Switch',
  description: 'Animated day/night toggle switch with clouds, stars, and a sun/moon.',
  category: 'Toggle',
  tags: ['toggle', 'theme', 'dark-mode', 'switch'],
  family: 'misc',
  deps: ['styled-components'],
  runnable: true,
}

export default meta
```

- [ ] **Step 3:** Write smoke test `index.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Switch from './index'

describe('Switch', () => {
  it('mounts without throwing', () => {
    const { container } = render(<Switch />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

- [ ] **Step 4:** Run: `npm run test -- theme-switch` — Expected: PASS

- [ ] **Step 5:** Commit:

```bash
git add library/src/components/theme-switch/
git commit -m "feat: port theme-switch component (v1)"
```

---

### Task 11: Port `profile-card` (v3 → `ProfileCard`)

**Files:**
- Create: `library/src/components/profile-card/index.tsx`, `library/src/components/profile-card/ProfileCard.css`, `library/src/components/profile-card/meta.ts`, `library/src/components/profile-card/index.test.tsx`

- [ ] **Step 1:** From `v3.txt`, extract lines 57–453 (the code between the ` ```tsx ` fence after "### Full Component Source" and its closing ` ``` `) verbatim into `library/src/components/profile-card/index.tsx`. It already ends with `export default ProfileCard;` — no edit needed.

- [ ] **Step 2:** From `v3.txt`, extract lines 458–1020 (the code between the ` ```css ` fence after "### Component CSS" and its closing ` ``` `) verbatim into `library/src/components/profile-card/ProfileCard.css`.

- [ ] **Step 3:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'profile-card',
  name: 'Profile Card',
  description: 'Tilting business-card style profile with cursor-reactive glow and avatar.',
  category: 'Cards',
  tags: ['card', 'tilt', 'profile', 'glow'],
  family: 'react-bits',
  deps: [],
  runnable: true,
}

export default meta
```

- [ ] **Step 4:** Write smoke test:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProfileCard from './index'

describe('ProfileCard', () => {
  it('mounts without throwing', () => {
    const { container } = render(<ProfileCard avatarUrl="/test-avatar.jpg" name="Test" />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

- [ ] **Step 5:** Run: `npm run test -- profile-card` — Expected: PASS

- [ ] **Step 6:** Commit:

```bash
git add library/src/components/profile-card/
git commit -m "feat: port profile-card component (v3)"
```

---

### Task 12: Port `option-wheel` (v4 → `OptionWheel`)

**Files:**
- Create: `library/src/components/option-wheel/index.tsx`, `library/src/components/option-wheel/meta.ts`, `library/src/components/option-wheel/index.test.tsx`

- [ ] **Step 1:** From `v4.txt`, extract lines 63–410 (between the ` ```tsx ` fence after "### Full Component Source" at line 62 and its closing ` ``` ` at line 411) verbatim into `index.tsx`. Already ends with `export default OptionWheel;` — no edit needed.

- [ ] **Step 2:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'option-wheel',
  name: 'Option Wheel',
  description: 'Draggable curved wheel for picking one of several options via scroll, drag, or keyboard.',
  category: 'Navigation',
  tags: ['wheel', 'picker', 'drag', 'keyboard'],
  family: 'react-bits',
  deps: [],
  runnable: true,
}

export default meta
```

- [ ] **Step 3:** Write smoke test. Open `index.tsx` and check `OptionWheelProps` (around line 67 of the original `v4.txt`) for any required fields; if `options` (or similarly named array prop) is required, pass a minimal 2-item fixture array of that shape. Otherwise render with no props:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import OptionWheel from './index'

describe('OptionWheel', () => {
  it('mounts without throwing', () => {
    const { container } = render(<OptionWheel />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

- [ ] **Step 4:** Run: `npm run test -- option-wheel` — Expected: PASS. If it fails because a prop is required, add the minimal fixture for that prop (per the interface found in Step 3) and re-run.

- [ ] **Step 5:** Commit:

```bash
git add library/src/components/option-wheel/
git commit -m "feat: port option-wheel component (v4)"
```

---

### Task 13: Port `line-sidebar` (v5 → `LineSidebar`)

**Files:**
- Create: `library/src/components/line-sidebar/index.tsx`, `library/src/components/line-sidebar/meta.ts`, `library/src/components/line-sidebar/index.test.tsx`

- [ ] **Step 1:** From `v5.txt`, extract lines 62–284 (between the ` ```tsx ` fence after "### Full Component Source" at line 61 and its closing ` ``` ` at line 285) verbatim into `index.tsx`. Already ends with `export default LineSidebar;`.

- [ ] **Step 2:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'line-sidebar',
  name: 'Line Sidebar',
  description: 'Minimal line-based sidebar navigation with animated active indicator.',
  category: 'Navigation',
  tags: ['sidebar', 'nav', 'lines'],
  family: 'react-bits',
  deps: [],
  runnable: true,
}

export default meta
```

- [ ] **Step 3:** Write smoke test, checking `LineSidebarProps` (around line 66 of the original `v5.txt`) for required fields the same way as Task 12:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LineSidebar from './index'

describe('LineSidebar', () => {
  it('mounts without throwing', () => {
    const { container } = render(<LineSidebar />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

- [ ] **Step 4:** Run: `npm run test -- line-sidebar` — Expected: PASS (add fixture props if a required prop surfaces, as in Task 12).

- [ ] **Step 5:** Commit:

```bash
git add library/src/components/line-sidebar/
git commit -m "feat: port line-sidebar component (v5)"
```

---

### Task 14: Port `stylish-carousel` (v6 → `StylishCarousel`)

**Files:**
- Create: `library/src/components/stylish-carousel/index.tsx`, `library/src/components/stylish-carousel/meta.ts`, `library/src/components/stylish-carousel/index.test.tsx`

- [ ] **Step 1:** From `v6.txt`, extract lines 74–374 (from `"use client";` through `export default StylishCarousel;`) into `index.tsx`. This discards the scraped Lightswind site chrome before line 74 and after line 374 (nav, pricing, marketing blocks, "How to Import"/"Props"/"Basic Usage" docs).

- [ ] **Step 2:** Edit the import at the top: change `import { cn } from "../lib/utils";` to `import { cn } from "@/lib/utils";`.

- [ ] **Step 3:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'stylish-carousel',
  name: 'Stylish Carousel',
  description: 'Fan-out 3D perspective image carousel with spring physics, autoplay, and dot navigation.',
  category: 'Cards',
  tags: ['carousel', '3d', 'fanout', 'images'],
  family: 'misc',
  deps: ['framer-motion', 'lucide-react'],
  runnable: true,
}

export default meta
```

- [ ] **Step 4:** Write smoke test with a 3-item fixture (the component's `items` prop requires at least one entry with a `src`):

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StylishCarousel from './index'

const items = [
  { src: '/fixtures/one.jpg', title: 'One' },
  { src: '/fixtures/two.jpg', title: 'Two' },
  { src: '/fixtures/three.jpg', title: 'Three' },
]

describe('StylishCarousel', () => {
  it('mounts without throwing', () => {
    const { container } = render(<StylishCarousel items={items} />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

- [ ] **Step 5:** Run: `npm run test -- stylish-carousel` — Expected: PASS

- [ ] **Step 6:** Commit:

```bash
git add library/src/components/stylish-carousel/
git commit -m "feat: port stylish-carousel component (v6), strip scraped page chrome"
```

---

### Task 15: Port `hover-image-reveal` (v7 → `HoverImageReveal`)

**Files:**
- Create: `library/src/components/hover-image-reveal/index.tsx`, `library/src/components/hover-image-reveal/meta.ts`, `library/src/components/hover-image-reveal/index.test.tsx`

- [ ] **Step 1:** Copy the entire contents of `v7.txt` verbatim into `index.tsx`. It's already self-contained with `export default function HoverImageReveal(...)`, only depends on `framer-motion` (already installed).

- [ ] **Step 2:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'hover-image-reveal',
  name: 'Hover Image Reveal',
  description: 'Text list where hovering an item reveals a floating image that follows the cursor.',
  category: 'Hover',
  tags: ['hover', 'image', 'reveal', 'cursor'],
  family: 'misc',
  deps: ['framer-motion'],
  runnable: true,
}

export default meta
```

- [ ] **Step 3:** Write smoke test. Check the `Item`/`ItemsValue` interfaces near the top of the file (as extracted in Step 1) for required props and pass a minimal fixture list:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HoverImageReveal from './index'

describe('HoverImageReveal', () => {
  it('mounts without throwing', () => {
    const { container } = render(<HoverImageReveal />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

- [ ] **Step 4:** Run: `npm run test -- hover-image-reveal` — Expected: PASS (add fixture items if the default render throws due to a required prop).

- [ ] **Step 5:** Commit:

```bash
git add library/src/components/hover-image-reveal/
git commit -m "feat: port hover-image-reveal component (v7)"
```

---

### Task 16: Port `cursor-particle-typography` (v8 → `CursorDrivenParticleTypography`)

**Files:**
- Create: `library/src/components/cursor-particle-typography/index.tsx`, `library/src/components/cursor-particle-typography/meta.ts`, `library/src/components/cursor-particle-typography/index.test.tsx`

- [ ] **Step 1:** Copy the entire contents of `v8.txt` into `index.tsx`.

- [ ] **Step 2:** Edit the import: change `import { cn } from "@workspace/ui/lib/utils";` to `import { cn } from "@/lib/utils";`.

- [ ] **Step 3:** Add a default export. The file exports `export function CursorDrivenParticleTypography({...})` (named only) — add this line at the end of the file:

```ts
export default CursorDrivenParticleTypography;
```

- [ ] **Step 4:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'cursor-particle-typography',
  name: 'Cursor Particle Typography',
  description: 'Text rendered as particles on a canvas that scatter away from the cursor and drift back.',
  category: 'Cursor',
  tags: ['particles', 'canvas', 'cursor', 'typography'],
  family: 'misc',
  deps: [],
  background: 'dark',
  runnable: true,
}

export default meta
```

- [ ] **Step 5:** Write smoke test (the component requires a `text` prop per its `Props` interface):

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CursorDrivenParticleTypography from './index'

describe('CursorDrivenParticleTypography', () => {
  it('mounts without throwing', () => {
    const { container } = render(<CursorDrivenParticleTypography text="Hello" />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

- [ ] **Step 6:** Run: `npm run test -- cursor-particle-typography` — Expected: PASS

- [ ] **Step 7:** Commit:

```bash
git add library/src/components/cursor-particle-typography/
git commit -m "feat: port cursor-particle-typography component (v8), fix import + add default export"
```

---

### Task 17: Catalog `scroll-split-card` (v9 → reference only, not runnable)

**Files:**
- Create: `library/src/components/scroll-split-card/index.tsx`, `library/src/components/scroll-split-card/meta.ts`

**Interfaces:**
- Produces: an entry with `runnable: false` — per Task 7, `ComponentDetail` shows the `notes` text instead of attempting a live render whenever `runnable` is false, so `index.tsx` here is a plain presentational stub (kept only so the folder shape matches every other component and the glob patterns don't need a special case).

- [ ] **Step 1:** Write `index.tsx` as a simple note component (not the real `ScrollSplitCard` — that source was never captured, only an install/usage snippet exists in `v9.txt`):

```tsx
export default function ScrollSplitCardReference() {
  return (
    <div className="text-sm text-neutral-500 p-4 border rounded">
      <p>The original ScrollSplitCard source was not captured — only a shadcn install command and usage example exist.</p>
      <pre className="mt-2 bg-neutral-100 p-2 rounded overflow-x-auto">
        npx shadcn@latest add @componentry/scroll-split-card
      </pre>
    </div>
  )
}
```

- [ ] **Step 2:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'scroll-split-card',
  name: 'Scroll Split Card (reference only)',
  description: 'shadcn-distributed component — only the install command and a usage example were captured, not the actual source.',
  category: 'Cards',
  tags: ['reference', 'shadcn', 'scroll'],
  family: 'misc',
  deps: [],
  runnable: false,
  notes: 'Original source not saved — only `npx shadcn@latest add @componentry/scroll-split-card` and a usage snippet exist (see original v9.txt). Install via the shadcn CLI to get the real component.',
}

export default meta
```

- [ ] **Step 3:** Manual verification: `npm run dev`, navigate to `/component/scroll-split-card`, confirm the notes text renders and no attempt is made to load a "real" carousel/card animation.

- [ ] **Step 4:** Commit:

```bash
git add library/src/components/scroll-split-card/
git commit -m "docs: catalog scroll-split-card as reference-only (v9 source was never captured)"
```

---

### Task 18: Port `sticky-scroll-cards` (v10 → `StickyScrollCards`)

**Files:**
- Create: `library/src/components/sticky-scroll-cards/index.tsx`, `library/src/components/sticky-scroll-cards/meta.ts`, `library/src/components/sticky-scroll-cards/index.test.tsx`

- [ ] **Step 1:** From `v10.txt`, extract lines 16–176 (between the ` ```tsx ` fence at line 15, following "## Source Code", and its closing ` ``` ` at line 177) into `index.tsx`. This already imports `@/lib/utils` correctly — no import edit needed.

- [ ] **Step 2:** Add a default export — the file exports `export function StickyScrollCards({...})` (named only). Add at the end:

```ts
export default StickyScrollCards;
```

- [ ] **Step 3:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'sticky-scroll-cards',
  name: 'Sticky Scroll Cards',
  description: 'Scroll-pinned image cards that stack and scale down as you scroll past them.',
  category: 'Scrolling',
  tags: ['scroll', 'sticky', 'cards', 'lenis'],
  family: 'componentry',
  deps: ['framer-motion', 'lenis'],
  previewHeight: 900,
  scrollable: true,
  runnable: true,
}

export default meta
```

- [ ] **Step 4:** Write smoke test with a 3-item fixture matching `StickyScrollCardItem` (`title`, `src`):

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StickyScrollCards from './index'

const items = [
  { title: 'One', src: '/fixtures/one.jpg' },
  { title: 'Two', src: '/fixtures/two.jpg' },
  { title: 'Three', src: '/fixtures/three.jpg' },
]

describe('StickyScrollCards', () => {
  it('mounts without throwing', () => {
    const { container } = render(<StickyScrollCards items={items} />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

- [ ] **Step 5:** Run: `npm run test -- sticky-scroll-cards` — Expected: PASS (adjust the fixture's prop name if the actual `StickyScrollCardsProps` field is named differently — check the interface in the file created in Step 1).

- [ ] **Step 6:** Commit:

```bash
git add library/src/components/sticky-scroll-cards/
git commit -m "feat: port sticky-scroll-cards component (v10), add default export"
```

---

### Task 19: Port `flight-status-card` (v11 → `FlightStatusCardAdaptive`)

**Files:**
- Create: `library/src/components/flight-status-card/index.tsx`, `library/src/components/flight-status-card/meta.ts`, `library/src/components/flight-status-card/index.test.tsx`

- [ ] **Step 1:** From `v11.txt`, extract lines 16–433 (between the ` ```tsx ` fence at line 15 and its closing ` ``` ` at line 434) into `index.tsx`. This block ends with `export { FlightStatusCard, FlightStatusCardLight, FlightStatusCardAdaptive, DotMatrixText, DotMatrixChar }` — named exports only.

- [ ] **Step 2:** Add a default export using the variant the original demo used (`FlightStatusCardAdaptive`, per the usage example at the end of `v11.txt`). Add at the end of the file:

```ts
export default FlightStatusCardAdaptive;
```

- [ ] **Step 3:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'flight-status-card',
  name: 'Flight Status Card',
  description: 'Flight-tracker widget with dot-matrix airport codes, progress bar, and ETA.',
  category: 'Cards',
  tags: ['widget', 'flight', 'dot-matrix', 'travel'],
  family: 'componentry',
  deps: ['framer-motion', 'clsx', 'tailwind-merge'],
  runnable: true,
}

export default meta
```

- [ ] **Step 4:** Write smoke test. Check `FlightStatusCardProps` (in the file from Step 1) for required fields (likely origin/destination airport codes and a progress value) and pass minimal fixtures:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import FlightStatusCardAdaptive from './index'

describe('FlightStatusCardAdaptive', () => {
  it('mounts without throwing', () => {
    const { container } = render(<FlightStatusCardAdaptive />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

- [ ] **Step 5:** Run: `npm run test -- flight-status-card` — Expected: PASS (add required fixture props found in Step 4 if the no-props render throws).

- [ ] **Step 6:** Commit:

```bash
git add library/src/components/flight-status-card/
git commit -m "feat: port flight-status-card component (v11), add default export"
```

---

### Task 20: Port `magnetic-dock` (v12 → `MagneticDock`)

**Files:**
- Create: `library/src/components/magnetic-dock/index.tsx`, `library/src/components/magnetic-dock/meta.ts`, `library/src/components/magnetic-dock/index.test.tsx`

- [ ] **Step 1:** From `v12.txt`, extract lines 16–453 (between the ` ```tsx ` fence at line 15 and its closing ` ``` ` at line 454) into `index.tsx`. Ends with an `export { ... }` block including `MagneticDock` (named only).

- [ ] **Step 2:** Add a default export:

```ts
export default MagneticDock;
```

- [ ] **Step 3:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'magnetic-dock',
  name: 'Magnetic Dock',
  description: 'macOS-style dock with cursor-following magnification and spring physics.',
  category: 'Navigation',
  tags: ['dock', 'magnetic', 'macos', 'navigation'],
  family: 'componentry',
  deps: ['framer-motion'],
  background: 'dark',
  runnable: true,
}

export default meta
```

- [ ] **Step 4:** Write smoke test with a minimal `items` fixture matching `DockItemData` (in the file from Step 1 — likely `icon`/`label`):

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MagneticDock from './index'

const items = [
  { label: 'Finder', icon: '/fixtures/icon.png' },
  { label: 'Mail', icon: '/fixtures/icon.png' },
]

describe('MagneticDock', () => {
  it('mounts without throwing', () => {
    const { container } = render(<MagneticDock items={items} />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

- [ ] **Step 5:** Run: `npm run test -- magnetic-dock` — Expected: PASS (adjust fixture field names to match the actual `DockItemData` shape from the file if they differ).

- [ ] **Step 6:** Commit:

```bash
git add library/src/components/magnetic-dock/
git commit -m "feat: port magnetic-dock component (v12), add default export"
```

---

### Task 21: Port `collection-surfer` (v13 → `CollectionSurfer`)

**Files:**
- Create: `library/src/components/collection-surfer/index.tsx`, `library/src/components/collection-surfer/meta.ts`, `library/src/components/collection-surfer/index.test.tsx`

- [ ] **Step 1:** Copy the entire contents of `v13.txt` verbatim into `index.tsx` — it has no scraped doc header/footer, and its default `ITEMS` fixture array means it renders with zero required props.

- [ ] **Step 2:** Add a default export — the file exports `export function CollectionSurfer({...})` (named only). Add at the end:

```ts
export default CollectionSurfer;
```

- [ ] **Step 3:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'collection-surfer',
  name: 'Collection Surfer',
  description: 'Scroll-driven image collection with magnetic, uplift, and simple layout variants.',
  category: 'Scrolling',
  tags: ['scroll', 'gallery', 'magnetic', 'parallax'],
  family: 'componentry',
  deps: ['framer-motion'],
  previewHeight: 900,
  scrollable: true,
  runnable: true,
}

export default meta
```

- [ ] **Step 4:** Write smoke test (no props required — the component has default `ITEMS`):

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CollectionSurfer from './index'

describe('CollectionSurfer', () => {
  it('mounts without throwing', () => {
    const { container } = render(<CollectionSurfer />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

- [ ] **Step 5:** Run: `npm run test -- collection-surfer` — Expected: PASS

- [ ] **Step 6:** Commit:

```bash
git add library/src/components/collection-surfer/
git commit -m "feat: port collection-surfer component (v13), add default export"
```

---

### Task 22: Port `github-calendar` (v14 → `GithubCalendar`)

**Files:**
- Create: `library/src/components/github-calendar/index.tsx`, `library/src/components/github-calendar/meta.ts`, `library/src/components/github-calendar/index.test.tsx`

- [ ] **Step 1:** From `v14.txt`, extract lines 16–269 (between the ` ```tsx ` fence at line 15 and its closing ` ``` ` at line 270) into `index.tsx`.

- [ ] **Step 2:** Add a default export — the file exports `export function GithubCalendar({...})` (named only). Add at the end:

```ts
export default GithubCalendar;
```

- [ ] **Step 3:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'github-calendar',
  name: 'GitHub Calendar',
  description: 'Customizable GitHub contribution graph visualization with multiple color schemes.',
  category: 'Cards',
  tags: ['github', 'calendar', 'contribution-graph', 'data-viz'],
  family: 'componentry',
  deps: ['framer-motion', 'clsx', 'tailwind-merge'],
  runnable: true,
}

export default meta
```

- [ ] **Step 4:** Write smoke test. Check `GithubCalendarProps`/`GithubContributionData` (in the file from Step 1) for the shape of the required contribution data and pass a minimal fixture (e.g. a handful of days with a `contributionCount`/`contributionLevel`):

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import GithubCalendar from './index'

describe('GithubCalendar', () => {
  it('mounts without throwing', () => {
    const { container } = render(<GithubCalendar />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

- [ ] **Step 5:** Run: `npm run test -- github-calendar` — Expected: PASS (add the fixture contribution data found in Step 4 if the no-props render throws).

- [ ] **Step 6:** Commit:

```bash
git add library/src/components/github-calendar/
git commit -m "feat: port github-calendar component (v14), add default export"
```

---

### Task 23: Port `eye-tracking` (v15 → `EyeTracking`)

**Files:**
- Create: `library/src/components/eye-tracking/index.tsx`, `library/src/components/eye-tracking/meta.ts`, `library/src/components/eye-tracking/index.test.tsx`

- [ ] **Step 1:** From `v15.txt`, extract lines 16–562 (between the ` ```tsx ` fence at line 15 and its closing ` ``` ` at line 563) into `index.tsx`.

- [ ] **Step 2:** Add a default export — the file exports `export function EyeTracking({...})` (named only). Add at the end:

```ts
export default EyeTracking;
```

- [ ] **Step 3:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'eye-tracking',
  name: 'Eye Tracking',
  description: 'Realistic animated eyes that follow the cursor with spring physics and blinking.',
  category: 'Cursor',
  tags: ['eyes', 'cursor', 'spring', 'fun'],
  family: 'componentry',
  deps: ['framer-motion', 'clsx', 'tailwind-merge'],
  runnable: true,
}

export default meta
```

- [ ] **Step 4:** Write smoke test:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EyeTracking from './index'

describe('EyeTracking', () => {
  it('mounts without throwing', () => {
    const { container } = render(<EyeTracking />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

- [ ] **Step 5:** Run: `npm run test -- eye-tracking` — Expected: PASS (add required fixture props per `EyeTrackingProps` in the Step 1 file if the no-props render throws).

- [ ] **Step 6:** Commit:

```bash
git add library/src/components/eye-tracking/
git commit -m "feat: port eye-tracking component (v15), add default export"
```

---

### Task 24: Port `signature` (v16 → `Signature`)

**Files:**
- Create: `library/src/components/signature/index.tsx`, `library/src/components/signature/meta.ts`, `library/src/components/signature/index.test.tsx`

- [ ] **Step 1:** From `v16.txt`, extract lines 16–190 (between the ` ```tsx ` fence at line 15 and its closing ` ``` ` at line 191) into `index.tsx`. This already imports `opentype`, `framer-motion`, and `@/lib/utils` correctly — no import edits needed.

- [ ] **Step 2:** Add a default export — the file exports `export function Signature({...})` (named only). Add at the end:

```ts
export default Signature;
```

- [ ] **Step 3:** Write `meta.ts`:

```ts
import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'signature',
  name: 'Signature',
  description: 'Hand-written SVG signature draw-on animation generated from a font via opentype.js.',
  category: 'Typography',
  tags: ['svg', 'signature', 'handwriting', 'opentype'],
  family: 'componentry',
  deps: ['framer-motion', 'opentype.js'],
  runnable: true,
}

export default meta
```

- [ ] **Step 4:** Write smoke test with the `text` prop (per `SignatureProps` — check whether it defaults; if not, supply it):

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Signature from './index'

describe('Signature', () => {
  it('mounts without throwing', () => {
    const { container } = render(<Signature text="Test Name" />)
    expect(container.firstChild).not.toBeNull()
  })
})
```

- [ ] **Step 5:** Run: `npm run test -- signature` — Expected: PASS. Note `opentype.js` loads a font asynchronously — if the smoke test needs to wait, switch to `await screen.findByRole(...)` or an equivalent async query instead of a synchronous assertion.

- [ ] **Step 6:** Commit:

```bash
git add library/src/components/signature/
git commit -m "feat: port signature component (v16), add default export"
```

---

### Task 25: Full integration verification, cleanup, and retire the `v*.txt` files

**Files:**
- Delete: `v1.txt` through `v16.txt`, `effect names.txt`
- Modify: none (verification only, beyond the deletions)

- [ ] **Step 1:** Run the full test suite

Run: `npm run test` (from `library/`)
Expected: all tests across all 24 previous tasks PASS

- [ ] **Step 2:** Run the production build

Run: `npm run build`
Expected: succeeds with no errors

- [ ] **Step 3:** Browser spot-check via claude-in-chrome

Run `npm run dev`, then in the browser:
- Load `/`, confirm all 16 cards appear (15 runnable + `scroll-split-card` reference), search for "cursor" narrows to `cursor-particle-typography` and `eye-tracking`, filtering by category "Cards" narrows correctly.
- Open `/component/theme-switch` (styled-components), `/component/magnetic-dock` (Tailwind/framer, dark stage), and `/component/signature` (opentype.js) — confirm each renders and responds to interaction with no console errors (`read_console_messages`).
- Open `/component/sticky-scroll-cards` and `/component/collection-surfer` — confirm the stage scrolls instead of clipping.
- Navigate into and away from `cursor-particle-typography`, `signature`, `magnetic-dock`, and `sticky-scroll-cards` three times each; confirm no console errors accumulate and no runaway animation-frame warnings appear.
- Open `/showcase/koisei-landing` and confirm via `read_network_requests` that no request to `googletagmanager.com` fires.
- Open `/component/scroll-split-card` and confirm it shows the reference note, not a live carousel.
- Deliberately break one component temporarily (e.g. throw in `theme-switch`'s render) to confirm the ErrorBoundary fallback + Retry button work, then revert the temporary break.

- [ ] **Step 4:** Delete the retired source files

```bash
cd "C:\Users\Lokesh Patra\Documents\Projects\Designs\portfolio\Components"
git rm v1.txt v2.txt v3.txt v4.txt v5.txt v6.txt v7.txt v8.txt v9.txt v10.txt v11.txt v12.txt v13.txt v14.txt v15.txt v16.txt "effect names.txt"
```

- [ ] **Step 5:** Commit

```bash
git commit -m "$(cat <<'EOF'
chore: verify full gallery, retire ported v*.txt source files

All 16 components (15 runnable + 1 reference-only) are ported into
named folders under library/src/components/, the full test suite and
production build pass, and manual browser verification confirms no
console errors, correct scroll behavior for scroll-driven demos, no
tracking network calls from the koisei-landing showcase, and working
ErrorBoundary recovery.
EOF
)"
```

---

## Plan Self-Review Notes

- **Spec coverage:** Every spec section maps to a task — Structure/Catalog Generation → Tasks 1–5, 8; Component Metadata/Category Taxonomy → Task 2 (embedded in every port task); Per-Component Porting Rules → Tasks 9–24; Gallery Behavior (search/sort/restart/error retry/lazy load) → Tasks 3, 4, 6, 7; Preview Stage → Task 4; Dependencies → Task 1; Asset Handling → no task needed (spec confirms nothing currently requires it); Verification → Task 25; Out of Scope items are simply not tasked.
- **Naming:** original `v*.txt` files are renamed to their real component slugs throughout (per the explicit follow-up request), and retired only in Task 25 after verification.
- **Type consistency:** `ComponentMeta`/`Category`/`Family` (Task 2) are the single source of truth referenced unchanged by every subsequent task's `meta.ts`; `CatalogEntry` (Task 5) extends `ComponentMeta` and is consumed unchanged by `Home`, `ComponentDetail`, and `App.tsx`.
