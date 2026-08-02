import { HashRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import { getCatalog, type CatalogEntry } from '@/catalog'
import { Home } from '@/pages/Home'
import { ComponentDetail } from '@/pages/ComponentDetail'
import { FullPageShowcase } from '@/pages/FullPageShowcase'
import { Changelog } from '@/pages/Changelog'
import ThemeSwitch from '@/components/theme-switch'

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
      <Route path="/changelog" element={<Changelog />} />
    </Routes>
  )
}

export default function App() {
  const entries = getCatalog()
  const runnableCount = entries.filter((e) => e.runnable).length

  return (
    <HashRouter>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4 sm:px-10">
            <Link to="/" className="group flex items-baseline gap-3">
              <span className="font-mono text-[0.7rem] tracking-[0.2em] text-accent">SPC—01</span>
              <span className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent">
                Specimen
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="hidden font-mono text-[0.7rem] tracking-[0.15em] text-muted-foreground sm:block">
                {String(runnableCount).padStart(2, '0')} SPECIMENS CATALOGUED
              </span>
              <Link
                to="/changelog"
                className="font-mono text-[0.7rem] tracking-[0.15em] text-muted-foreground transition-colors hover:text-accent"
              >
                CHANGELOG
              </Link>
              {/* theme-switch hardcodes --toggle-size: 30px on its own root, which
                  shadows any inherited override — scale the whole thing down instead. */}
              <div className="relative shrink-0" style={{ width: 63, height: 28, overflow: 'hidden' }}>
                <div style={{ transform: 'scale(0.373)', transformOrigin: 'top left' }}>
                  <ThemeSwitch />
                </div>
              </div>
            </div>
          </div>
        </header>
        <AppRoutes entries={entries} />
        <footer className="border-t border-border/80 px-6 py-6 text-center sm:px-10">
          <a
            href="https://lightxlk.github.io/"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[0.68rem] tracking-[0.1em] text-muted-foreground transition-colors hover:text-accent"
          >
            Curated by Lokesh
          </a>
        </footer>
      </div>
    </HashRouter>
  )
}
