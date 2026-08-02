import { describe, it, expect } from 'vitest'
import { parseChangelog } from './changelog'

const SAMPLE = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.2.0] - 2026-08-02 [YANKED]

### Added

- A new feature that wraps onto
  a second line.

### Fixed

- A bug fix.

## [0.1.0] - 2026-08-01

### Added

- Initial release.

[unreleased]: https://example.com/compare/v0.2.0...HEAD
[0.2.0]: https://example.com/compare/v0.1.0...v0.2.0
[0.1.0]: https://example.com/releases/tag/v0.1.0
`

describe('parseChangelog', () => {
  const { intro, releases } = parseChangelog(SAMPLE)

  it('captures intro prose before the first release heading', () => {
    expect(intro.join(' ')).toContain('Keep a Changelog')
  })

  it('parses every release, newest first, in file order', () => {
    expect(releases.map((r) => r.version)).toEqual(['Unreleased', '0.2.0', '0.1.0'])
  })

  it('parses date and yanked flag', () => {
    const v2 = releases.find((r) => r.version === '0.2.0')!
    expect(v2.date).toBe('2026-08-02')
    expect(v2.yanked).toBe(true)
    const unreleased = releases.find((r) => r.version === 'Unreleased')!
    expect(unreleased.date).toBeNull()
    expect(unreleased.yanked).toBe(false)
  })

  it('resolves the compare/diff link from the reference-style footer', () => {
    const v1 = releases.find((r) => r.version === '0.1.0')!
    expect(v1.href).toBe('https://example.com/releases/tag/v0.1.0')
  })

  it('groups bullets under their section, joining wrapped continuation lines', () => {
    const v2 = releases.find((r) => r.version === '0.2.0')!
    expect(v2.sections).toEqual([
      { type: 'Added', items: ['A new feature that wraps onto a second line.'] },
      { type: 'Fixed', items: ['A bug fix.'] },
    ])
  })

  it('omits sections entirely for a release with none (Unreleased here)', () => {
    const unreleased = releases.find((r) => r.version === 'Unreleased')!
    expect(unreleased.sections).toEqual([])
  })
})
