# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server with HMR
npm run build     # tsc -b (type-check) then vite build -> dist/
npm run lint      # oxlint (config: .oxlintrc.json)
npm test          # vitest run (all suites, once)
npm run preview   # serve the production build locally
```

Single test file: `npx vitest run src/components/eye-tracking/index.test.tsx`
Single test by name: `npx vitest run -t "test name substring"`
Watch mode: `npx vitest` (no `run`).

Before opening a PR, lint + test + build must all pass (CI enforces this too).

## Architecture

**Specimen** is a catalog of self-contained React interaction components (cards, nav, scroll,
typography, cursor, motion, 3D, toggles), each independently previewable with live source view.
Deployed as a static site to GitHub Pages, so routing and asset paths are constrained by that
target (see below).

### Glob-based catalog — the core mechanic

There is no central registry file. `src/catalog.ts` uses `import.meta.glob` to auto-discover
every component under `src/components/*/`:
- `meta.ts` (eager-loaded) supplies `ComponentMeta` — slug, name, description, category, tags,
  family, deps, runnable flag, preview sizing/background.
- `index.tsx` (lazy-loaded via `React.lazy`) is the actual component.
- The same `index.tsx` is also loaded a second time with `{ query: '?raw' }` to get its raw
  source text for the syntax-highlighted source view (Shiki) on the detail page.

**To add a new specimen: create `src/components/<slug>/index.tsx` + `meta.ts`.** It appears in
the catalog automatically — nothing else to wire up. `folderFromPath()` in `catalog.ts` derives
the slug from the folder name, so slug and folder name must match.

`ComponentMeta.category` and `.family` are closed union types in `src/types.ts` — extending the
taxonomy means editing that file first.

### Routing & deployment constraints

- `HashRouter` is used (not `BrowserRouter`) because GitHub Pages has no server-side rewrites —
  routes are `#/component/:slug`, `#/showcase/:slug`, `#/changelog`.
- `vite.config.ts` sets `base: '/scaling-memory-elements/'` to match the Pages subpath. Don't
  change this without also updating the deploy workflow/repo name assumption.
- `.github/workflows/deploy-pages.yml` runs on push to `master` touching app source/config
  files (see its `paths:` list): install → lint → test → build → publish `dist/` to Pages.

### App structure

- `src/App.tsx` — top-level layout (header, theme switch, footer, developer easter egg) +
  `AppRoutes` (Home / ComponentDetail / FullPageShowcase / Changelog).
- `src/pages/` — the four route-level views.
- `src/components-lib/` — shared app chrome, not specimens themselves: `ErrorBoundary` (wraps
  each live preview so one broken specimen can't crash the app), `PreviewStage` (standardized
  preview container — background/height/scrollable props come from the specimen's `meta.ts`),
  `DeveloperEasterEgg` (`Alt+Shift+L+K` opens the author's site; no-ops while focus is in an
  input/textarea/contenteditable).
- `src/lib/` — framework-agnostic utilities: `cn` (clsx + tailwind-merge), theme persistence,
  `CHANGELOG.md` parsing for the in-app `/changelog` page.
- `src/components/lib/utils.ts` — a *second*, component-scoped utils file distinct from
  `src/lib/utils.ts`; don't conflate the two when importing.

### Testing conventions

Vitest + React Testing Library + jsdom (`vitest.config.ts` sets `environment: 'jsdom'`,
`globals: true`, setup in `vitest.setup.ts`). Tests live beside their source as `*.test.tsx`.
Not every specimen has a test file — coverage is uneven by design (visual/animation-heavy
components are harder to meaningfully unit test).

### Styling

Tailwind CSS v4 (via `@tailwindcss/postcss`, no separate `tailwind.config.ts` content globbing
quirks to worry about) alongside `styled-components` for specimens that were ported from
sources already using CSS-in-JS. Both coexist — check the specimen's existing file before
picking one for a new component in the same folder.

### Path alias

`@/` maps to `src/` (configured in both `vite.config.ts` and `vitest.config.ts` — keep them in
sync if it ever changes).
