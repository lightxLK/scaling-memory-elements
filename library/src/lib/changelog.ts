export interface ChangelogSection {
  type: string
  items: string[]
}

export interface ChangelogRelease {
  /** e.g. "0.3.0", or "Unreleased" */
  version: string
  /** ISO 8601 date, or null for the Unreleased section */
  date: string | null
  yanked: boolean
  /** Resolved compare/diff URL, if the file defines one for this version */
  href: string | null
  sections: ChangelogSection[]
}

export interface ParsedChangelog {
  intro: string[]
  releases: ChangelogRelease[]
}

const REFERENCE_LINK = /^\[([^\]]+)\]:\s*(\S+)\s*$/
const RELEASE_HEADING = /^## \[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?(\s*\[YANKED\])?\s*$/i
const SECTION_HEADING = /^### (.+)$/
const BULLET_ITEM = /^-\s+(.*)$/
const TITLE_HEADING = /^# /

// Parses a Keep a Changelog–formatted markdown file into structured data.
// Intentionally hand-rolled rather than a full markdown parser: the format
// is a small, regular grammar (##/### headings, "- " bullets with wrapped
// continuation lines, and reference-style links at the bottom), and the
// source file is this project's own CHANGELOG.md, not arbitrary input.
export function parseChangelog(markdown: string): ParsedChangelog {
  const links = new Map<string, string>()
  const lines: string[] = []

  for (const rawLine of markdown.split('\n')) {
    const linkMatch = rawLine.match(REFERENCE_LINK)
    if (linkMatch) {
      links.set(linkMatch[1].toLowerCase(), linkMatch[2])
      continue
    }
    lines.push(rawLine)
  }

  const intro: string[] = []
  const releases: ChangelogRelease[] = []
  let currentRelease: ChangelogRelease | null = null
  let currentSection: ChangelogSection | null = null

  for (const line of lines) {
    const releaseMatch = line.match(RELEASE_HEADING)
    if (releaseMatch) {
      currentRelease = {
        version: releaseMatch[1],
        date: releaseMatch[2] ?? null,
        yanked: Boolean(releaseMatch[3]),
        href: links.get(releaseMatch[1].toLowerCase()) ?? null,
        sections: [],
      }
      releases.push(currentRelease)
      currentSection = null
      continue
    }

    const sectionMatch = line.match(SECTION_HEADING)
    if (sectionMatch && currentRelease) {
      currentSection = { type: sectionMatch[1].trim(), items: [] }
      currentRelease.sections.push(currentSection)
      continue
    }

    const bulletMatch = line.match(BULLET_ITEM)
    if (bulletMatch && currentSection) {
      currentSection.items.push(bulletMatch[1])
      continue
    }

    if (TITLE_HEADING.test(line)) continue
    if (line.trim() === '') continue

    // A non-blank, non-heading, non-bullet line: either intro prose (no
    // release seen yet) or a wrapped continuation of the previous bullet.
    if (currentSection && currentSection.items.length > 0) {
      const items = currentSection.items
      items[items.length - 1] = `${items[items.length - 1]} ${line.trim()}`
    } else if (!currentRelease) {
      intro.push(line.trim())
    }
  }

  return { intro, releases }
}
