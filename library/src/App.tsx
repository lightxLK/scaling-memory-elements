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
