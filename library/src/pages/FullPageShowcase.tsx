import type { CatalogEntry } from '@/catalog'

export function FullPageShowcase({ entry }: { entry: CatalogEntry }) {
  return (
    <iframe
      title={entry.name}
      src={`/showcases/${entry.slug}.html`}
      loading="lazy"
      className="w-full h-screen border-0"
    />
  )
}
