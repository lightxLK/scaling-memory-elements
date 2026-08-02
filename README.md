# Specimen

A working index of React interaction components: 20 self-contained, live-running specimens
(cards, navigation, scroll, typography, cursor, motion, 3D, toggles) with searchable/filterable
catalog, live preview, and highlighted source view for each.

![React](https://img.shields.io/badge/React-19-149ECA?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?style=flat&logo=vitest&logoColor=white)
![License](https://img.shields.io/badge/license-Proprietary-lightgrey?style=flat)

## Motivation

Static export because the production host is GitHub Pages: `HashRouter` (no server-side
rewrites available) and a Vite `base` path scoped to the repo name. Each specimen is a
self-contained folder (`index.tsx` + `meta.ts`) discovered at build time via
`import.meta.glob`, so adding a component never touches a central registry file.

## Build & Deployment Status

Deployed via [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml):
lint → test → build → publish to GitHub Pages on every push to `master` that touches
app source/config files.

## Code Style

- **Linter:** [Oxlint](https://oxc.rs) (`npm run lint`), config in [`.oxlintrc.json`](./.oxlintrc.json) if present, else defaults.
- **Formatting:** no dedicated formatter configured; match surrounding file style.
- No pre-commit hooks wired.

## Tech Stack

| Category | Stack |
|---|---|
| Framework / rendering | ![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white) ![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white) |
| Styling / UI | ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) ![styled--components](https://img.shields.io/badge/styled--components-6-DB7093?style=for-the-badge&logo=styledcomponents&logoColor=white) |
| Animation / interaction | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=for-the-badge&logo=framer&logoColor=white) ![Three.js](https://img.shields.io/badge/Three.js-0.185-000000?style=for-the-badge&logo=three.js&logoColor=white) ![OGL](https://img.shields.io/badge/OGL-1-333333?style=for-the-badge) ![Lenis](https://img.shields.io/badge/Lenis-1-orange?style=for-the-badge) |
| Tooling | ![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white) ![Testing Library](https://img.shields.io/badge/Testing_Library-16-E33332?style=for-the-badge&logo=testing-library&logoColor=white) ![Oxlint](https://img.shields.io/badge/Oxlint-1-fdae2e?style=for-the-badge) |

## Features

- 20 ported interaction components across cards, navigation, scrolling, typography, cursor,
  motion, 3D, and toggle categories.
- Glob-based catalog: drop a folder in `src/components/`, it appears automatically.
- Search + category filtering on the home page.
- Live component previews with restart/error-recovery (`ErrorBoundary`) per specimen.
- Preview/Source tabs on each specimen's detail page, source rendered with Shiki
  syntax highlighting and a copy-to-clipboard button.
- Full-page showcase route per component.
- Persisted site-wide light/dark theme toggle.
- `Alt+Shift+L+K` (`⌥⇧LK` on macOS) developer easter egg — opens the author's site in a new
  tab; ignored while focus is inside an input/textarea/contenteditable.
- In-app `/changelog` page rendering `CHANGELOG.md`.

## Project Structure

```
public/                  Static assets (favicon, icon sprite, showcase HTML)
src/
├── components/          One folder per specimen: index.tsx + meta.ts (+ optional assets)
├── components-lib/      Shared app chrome (ErrorBoundary, PreviewStage, easter egg)
├── lib/                 Small framework-agnostic utilities (theme, changelog parsing)
├── pages/                Home, ComponentDetail, Changelog, FullPageShowcase
├── catalog.ts           import.meta.glob-based component/meta/source discovery
├── types.ts             Shared ComponentMeta / Category types
└── App.tsx              Router + top-level layout
CHANGELOG.md
vite.config.ts
```

## Getting Started

Prerequisites: Node 22+, npm.

```bash
git clone https://github.com/lightxLK/scaling-memory-elements.git
cd scaling-memory-elements
npm install
npm run dev
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then production build to `dist/` |
| `npm run lint` | Run Oxlint |
| `npm test` | Run the Vitest suite once |
| `npm run preview` | Serve the production build locally |

## Environment Variables

None. This is a fully static site with no backend, API keys, or runtime config.

## Testing

Vitest + React Testing Library + jsdom. Suites live alongside their source as
`*.test.tsx` / `*.test.ts`. Run with `npm test`.

## Deployment

[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) builds and
publishes on every push to `master` touching app source/config files: `npm install` →
`npm run lint` → `npm test` → `npm run build` → upload `dist/` as a Pages artifact → deploy. `vite.config.ts`
sets `base: '/scaling-memory-elements/'` to match the Pages subpath; routing uses `HashRouter`
since Pages serves no server-side rewrites.

## Contributing

- Branch off `master`, one focused change per PR.
- Before opening a PR: `npm run lint`, `npm test`, and `npm run build` must all pass.
- Commit messages: short, imperative, no AI/tool attribution trailers.
- New specimens: add a folder under `src/components/<slug>/` with `index.tsx` and `meta.ts`;
  the catalog picks it up automatically.

## Credits

Built and maintained by [lightxLK](https://lightxlk.github.io/).

## License

Proprietary — all rights reserved unless stated otherwise.
