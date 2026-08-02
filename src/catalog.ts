import { lazy, type ComponentType } from 'react'
import type { Category, ComponentMeta } from '@/types'

export interface CatalogEntry extends ComponentMeta {
  Component: ReturnType<typeof lazy> | null
  getSource: () => Promise<string>
}

// Left untyped deliberately - import.meta.glob's inferred shape varies across
// Vite versions. Values are validated by usage below (mod.default) rather than
// leaned on at the type level.
const metaModules = import.meta.glob('./components/*/meta.ts', { eager: true }) as Record<string, { default: ComponentMeta }>
const componentLoaders = import.meta.glob('./components/*/index.tsx') as Record<string, () => Promise<{ default: ComponentType }>>
// NOTE: `{ as: 'raw' }` is deprecated as of Vite 4+ (still functional but flagged
// for removal) in favor of `{ query: '?raw', import: 'default' }`. This project
// uses Vite 8.2.0, so we use the current, non-deprecated syntax.
const sourceLoaders = import.meta.glob('./components/*/index.tsx', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>

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
      Component: loader ? lazy(loader) : null,
      getSource: async () => (sourceLoader ? await sourceLoader() : ''),
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
