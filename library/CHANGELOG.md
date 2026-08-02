# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Cursor Particle Typography no longer leaks `touchstart`/`touchmove` listeners on the canvas:
  they were registered as inline anonymous functions and never removed, so every effect re-run
  (any prop change) stacked a duplicate pair.
- Stylish Carousel's swipe handler used a ternary purely for its side effect; rewritten as an
  explicit `if`/`else`.

### Changed

- Replaced em dashes with hyphens across the site and codebase (copy, comments, docs).
- CI now runs `lint` and `test` before `build` on every deploy.
- Rewrote README to the project's documentation standard (stack, structure, scripts, deploy).

### Removed

- Vite's default favicon (`public/favicon.svg`) and its `<link>` in `index.html`.

### Known Issues

- `react-router` has a high-severity advisory (CSRF bypass in RSC mode,
  GHSA-qwww-vcr4-c8h2). This app is a client-only SPA with no RSC usage, so it isn't
  exploitable here; a fix requires a major-version bump not yet available as a non-breaking
  patch. Tracked, not auto-upgraded.

## [0.3.0] - 2026-08-02

### Added

- Aurora Text Effect component - large display text with animated, blurred aurora-gradient
  layers blended behind it.
- Cool Slide Gallery component - a 3D coverflow-style image gallery with drag/swipe, keyboard
  navigation, autoplay, and title overlays.
- Footer credit linking to the site author's homepage.
- Recursive as the site-wide font.

### Fixed

- Sticky Scroll Cards no longer hijacks the whole page's scrolling. It previously drove its
  animation off the browser window's scroll position and injected a global stylesheet that hid
  the site's scrollbar for as long as it was mounted - visiting its detail page broke scrolling
  everywhere. It now owns a self-contained, fixed-height scroll container instead.
- Collection Surfer's sticky viewport no longer escapes its preview card. It used to use `fixed`
  positioning (relative to the browser viewport) and track window scroll instead of its own
  container, so it could visually break out of its bounded preview box.
- Scroll Split Card no longer double-scrolls - its preview stage was still wrapping it in a
  second, visibly-scrollbar'd container left over from before the component became
  self-contained.
- Native scrollbars hidden inside self-scrolling demo containers (Collection Surfer, Sticky
  Scroll Cards) that already carry an on-screen "scroll to reveal" hint, and hidden site-wide on
  `<html>`/`<body>` - scrolling stays fully functional via wheel, keyboard, and touch.
- Aurora Text Effect's preview no longer shows a visible seam between its own background and the
  surrounding preview stage, and no longer shows washed-out/inverted gradient colors depending on
  the site's active theme - its demo now runs inside a locally-scoped dark context instead of
  fighting the component's own theme-aware styling with forced colors.

## [0.2.0] - 2026-08-02

### Added

- Dark theme as the site default, with the theme-switch component wired up as a real, persisted,
  site-wide light/dark toggle in the nav bar (previously a decorative, non-functional demo).
- Code Block component - Shiki syntax-highlighted code display with a filename header and
  copy-to-clipboard button - used to render each specimen's source instead of a plain,
  unhighlighted `<pre>` dump.
- Preview/Source tabs on each specimen's detail page, replacing the old expand-below source view,
  with a fade + "view more" control for long source files.
- GitHub Pages deployment: HashRouter + Vite base path for static hosting, and a GitHub Actions
  workflow that builds and publishes the site on every push.

### Fixed

- The preview stage's light/dark backdrop now follows the site-wide theme toggle by default,
  instead of a separate, redundant per-page manual toggle that didn't track the new site theme.

## [0.1.0] - 2026-08-01

### Added

- Initial release: a Vite + React + Tailwind component gallery with a glob-based catalog, search
  and category filtering, live component previews with restart/error-recovery, and a full-page
  showcase route.
- Sixteen ported interaction components across cards, navigation, scrolling, typography, cursor,
  motion, 3D, and toggle categories.

[unreleased]: https://github.com/lightxLK/scaling-memory-elements/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/lightxLK/scaling-memory-elements/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/lightxLK/scaling-memory-elements/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/lightxLK/scaling-memory-elements/releases/tag/v0.1.0
