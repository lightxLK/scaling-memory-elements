import { Suspense, useState } from 'react'
import { ErrorBoundary } from '@/components-lib/ErrorBoundary'
import { PreviewStage } from '@/components-lib/PreviewStage'
import type { CatalogEntry } from '@/catalog'

export function ComponentDetail({ entry }: { entry: CatalogEntry }) {
  const [restartKey, setRestartKey] = useState(0)
  const [showSource, setShowSource] = useState(false)
  const [source, setSource] = useState<string | null>(null) // null = not yet fetched; cached after first load
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
    if (!showSource && source === null) setSource(await entry.getSource())
    setShowSource((v) => !v)
  }

  function restart() {
    setRestartKey((k) => k + 1)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{entry.name}</h2>
        <div className="flex gap-2">
          <button onClick={() => setStageBg((b) => (b === 'light' ? 'dark' : 'light'))} className="px-3 py-1 border rounded">
            Toggle {stageBg === 'light' ? 'dark' : 'light'}
          </button>
          <button onClick={restart} className="px-3 py-1 border rounded">
            Restart
          </button>
          <button onClick={toggleSource} className="px-3 py-1 border rounded">
            {showSource ? 'Hide source' : 'View source'}
          </button>
        </div>
      </div>
      <ErrorBoundary slug={entry.slug} onRetry={restart} key={restartKey}>
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
