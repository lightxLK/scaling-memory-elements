import { Link } from 'react-router-dom'
import { parseChangelog, type ChangelogSection } from '@/lib/changelog'
import changelogRaw from '../../CHANGELOG.md?raw'

const TYPE_COLOR: Record<string, string> = {
  Added: '#9fe07f',
  Changed: '#7fb6ff',
  Deprecated: '#ffd37f',
  Removed: '#ff8f8f',
  Fixed: '#ff6b4a',
  Security: '#ff8f8f',
}

function Section({ section }: { section: ChangelogSection }) {
  const color = TYPE_COLOR[section.type] ?? '#948c7d'
  return (
    <div className="mt-5 first:mt-0">
      <div className="flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.1em] text-muted-foreground">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span>{section.type.toUpperCase()}</span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {section.items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground">
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-border" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Changelog() {
  const { releases } = parseChangelog(changelogRaw)

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-10">
      <Link
        to="/"
        className="font-mono text-[0.68rem] tracking-[0.1em] text-muted-foreground transition-colors hover:text-accent"
      >
        ← INDEX
      </Link>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Changelog</h1>
      <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
        Every notable change to this catalog, newest first.
      </p>

      <div className="mt-10 flex flex-col gap-6">
        {releases.map((release) => (
          <div key={release.version} className="rounded-lg border border-border p-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {release.href ? (
                <a
                  href={release.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-sm font-semibold tracking-[0.04em] text-foreground transition-colors hover:text-accent"
                >
                  {release.version === 'Unreleased' ? 'UNRELEASED' : `v${release.version}`}
                </a>
              ) : (
                <span className="font-mono text-sm font-semibold tracking-[0.04em] text-foreground">
                  {release.version === 'Unreleased' ? 'UNRELEASED' : `v${release.version}`}
                </span>
              )}
              {release.date && (
                <span className="font-mono text-[0.68rem] tracking-[0.06em] text-muted-foreground">
                  {release.date}
                </span>
              )}
              {release.yanked && (
                <span className="rounded-full border border-accent px-2 py-0.5 font-mono text-[0.62rem] tracking-[0.06em] text-accent">
                  YANKED
                </span>
              )}
            </div>

            {release.sections.length === 0 ? (
              <p className="mt-3 font-mono text-sm text-muted-foreground">Nothing yet — check back soon.</p>
            ) : (
              release.sections.map((section) => <Section key={section.type} section={section} />)
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
