import { Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorBoundary } from '@/components-lib/ErrorBoundary'
import { PreviewStage } from '@/components-lib/PreviewStage'
import type { CatalogEntry } from '@/catalog'
import { CATEGORY_COLOR } from '@/lib/categoryColor'
import { cn } from '@/lib/utils'
import { useIsDarkTheme } from '@/lib/theme'
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from '@/components/code-block'

function Meta({ entry }: { entry: CatalogEntry }) {
  return (
    <div className="max-w-2xl">
      <Link
        to="/"
        className="font-mono text-[0.68rem] tracking-[0.1em] text-muted-foreground transition-colors hover:text-accent"
      >
        ← INDEX
      </Link>
      <div className="mt-3 flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.06em] text-muted-foreground">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLOR[entry.category] }} />
        <span>{entry.category.toUpperCase()}</span>
        <span className="text-border">/</span>
        <span>{entry.family}</span>
      </div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{entry.name}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
      {entry.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.62rem] tracking-[0.04em] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

type Tab = 'preview' | 'source'

export function ComponentDetail({ entry }: { entry: CatalogEntry }) {
  const [restartKey, setRestartKey] = useState(0)
  const [tab, setTab] = useState<Tab>('preview')
  const [source, setSource] = useState<string | null>(null) // null = not yet fetched; cached after first load
  const [sourceExpanded, setSourceExpanded] = useState(false)
  const isDark = useIsDarkTheme()

  if (!entry.runnable || !entry.Component) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-12 sm:px-10">
        <Meta entry={entry} />
        <p className="mt-8 border-t border-border pt-6 font-mono text-sm leading-relaxed text-muted-foreground">
          {entry.notes ?? 'This entry has no runnable source.'}
        </p>
      </div>
    )
  }

  const Component = entry.Component
  // Most specimens have no fixed backdrop requirement, so their preview stage
  // follows the site-wide theme switcher. A few (e.g. glowing/light-on-dark
  // components) declare an explicit `background` because they need that
  // backdrop to read correctly regardless of theme - that overrides the toggle.
  const stageBg = entry.background ?? (isDark ? 'dark' : 'light')

  async function selectTab(next: Tab) {
    if (next === 'source' && source === null) setSource(await entry.getSource())
    if (next === 'preview') setSourceExpanded(false)
    setTab(next)
  }

  function restart() {
    setRestartKey((k) => k + 1)
  }

  const tabClass = (active: boolean) =>
    cn(
      'rounded-full border px-3 py-1 font-mono text-[0.68rem] tracking-[0.06em] transition-colors',
      active
        ? 'border-foreground/40 text-foreground'
        : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
    )

  const controlClass =
    'rounded-full border border-border px-3 py-1 font-mono text-[0.68rem] tracking-[0.06em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground'

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 sm:px-10">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <Meta entry={entry} />
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex gap-1 rounded-full border border-border p-1">
            <button onClick={() => selectTab('preview')} className={tabClass(tab === 'preview')}>
              PREVIEW
            </button>
            <button onClick={() => selectTab('source')} className={tabClass(tab === 'source')}>
              SOURCE
            </button>
          </div>
          {tab === 'preview' && (
            <button onClick={restart} className={controlClass}>
              RESTART
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-border" hidden={tab !== 'preview'}>
        <ErrorBoundary slug={entry.slug} onRetry={restart} key={restartKey}>
          <Suspense fallback={<div className="flex h-64 items-center justify-center font-mono text-xs text-muted-foreground">LOADING…</div>}>
            <PreviewStage previewHeight={entry.previewHeight} background={stageBg} scrollable={entry.scrollable}>
              <Component />
            </PreviewStage>
          </Suspense>
        </ErrorBoundary>
      </div>

      {tab === 'source' && source !== null && (
        <div className="mt-8">
          <div className={cn('relative overflow-hidden rounded-lg', !sourceExpanded && 'max-h-[420px]')}>
            <CodeBlock code={source} language="tsx" showLineNumbers>
              <CodeBlockHeader>
                <CodeBlockTitle>
                  <CodeBlockFilename>{entry.slug}/index.tsx</CodeBlockFilename>
                </CodeBlockTitle>
                <CodeBlockActions>
                  <CodeBlockCopyButton />
                </CodeBlockActions>
              </CodeBlockHeader>
            </CodeBlock>
            {!sourceExpanded && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
            )}
          </div>
          <div className="mt-4 flex justify-center">
            <button onClick={() => setSourceExpanded((v) => !v)} className={controlClass}>
              {sourceExpanded ? 'VIEW LESS' : 'VIEW MORE'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
