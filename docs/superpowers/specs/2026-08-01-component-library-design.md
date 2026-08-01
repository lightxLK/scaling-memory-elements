# Component Library & Browsable Gallery — Design

## Context

This directory contains 16 files (`v1.txt`–`v16.txt`) — React/HTML/CSS component code saved as plain `.txt` (Notepad) files, scraped from various UI snippet sources (React Bits, Componentry, Lightswind, Originkit, and a full one-page site build). Goal: turn this into a proper, organized component library with a live, browsable gallery so components/designs can be picked visually instead of hunting through text files.

## Source Inventory

| File | New name (slug) | Family | What it is |
|---|---|---|---|
| v1 | `theme-switch` | misc | Animated day/night toggle switch (styled-components) |
| v2 | `koisei-landing` | full-page showcase | Complete parallax one-page site (Tailwind CDN, GSAP, Lenis, Three.js) — not a component |
| v3 | `profile-card` | react-bits | Tilting profile card with glow/avatar |
| v4 | `option-wheel` | react-bits | Draggable curved option picker |
| v5 | `line-sidebar` | react-bits | (React Bits format, sidebar nav effect) |
| v6 | `stylish-carousel` | misc (Lightswind) | Fan-out 3D perspective image carousel |
| v7 | `hover-image-reveal` | misc (Originkit) | Hover-driven image reveal list |
| v8 | `cursor-particle-typography` | misc | Text dissolves into cursor-fleeing particles |
| v9 | `scroll-split-card` | misc (shadcn) | **Reference only** — actual source not captured, only an install/usage snippet |
| v10 | `sticky-scroll-cards` | componentry | Scroll-pinned stacking/scaling image cards |
| v11 | `flight-status-card` | componentry | Flight-tracker widget w/ dot-matrix airport codes |
| v12 | `magnetic-dock` | componentry | macOS-style magnifying dock |
| v13 | `collection-surfer` | componentry | Scroll-driven image collection, magnetic/uplift/simple variants |
| v14 | `github-calendar` | componentry | GitHub contribution graph visualizer |
| v15 | `eye-tracking` | componentry | Cursor-following animated eyes |
| v16 | `signature` | componentry | Hand-written SVG signature draw animation (opentype.js) |

Original `v*.txt` files are retired once ported — their content lives on, correctly named, inside `library/src/components/<slug>/`. `effect names.txt` categories (parallax, hover effect, smooth loader, cursor effect, 3D motion, micro interactions, entrance reveal) seed the catalog's `category` tags.

## Structure

```
Components/
  library/                     # new Vite app — the gallery
    package.json
    vite.config.ts             # alias "@" -> "src"
    tailwind.config.ts
    public/
      showcases/
        koisei-landing.html    # v2, tracking/sandbox scripts stripped
    src/
      lib/utils.ts             # shared cn() helper (clsx + tailwind-merge)
      catalog.ts                # array of {slug,name,category,tags,family,description,deps,sourceFile,runnable}
      components/
        theme-switch/index.tsx
        profile-card/{index.tsx,ProfileCard.css}
        ... one folder per slug ...
      App.tsx                   # sidebar/grid layout, react-router
      pages/
        Home.tsx                # grid of cards, filter by category/family/search
        ComponentDetail.tsx     # live render (ErrorBoundary) + source/code panel
        FullPageShowcase.tsx    # iframe wrapper for koisei-landing.html
  docs/superpowers/specs/...
```

## Per-Component Porting Rules

- **v1, v3, v4, v5, v7, v10–v16**: move as-is into their slug folder; only path/import touch-ups.
- **v6**: strip ~70 lines of scraped Lightswind marketing/nav chrome; keep the component; point its `cn` import at `@/lib/utils`.
- **v8**: swap `@workspace/ui/lib/utils` (monorepo-only, unresolvable) for `@/lib/utils`.
- **v2**: strip embedded Google Analytics (`gtag`) and the "aura-preview-performance-controller" sandbox script; keep the rest verbatim as a static HTML file; catalog it as `family: "full-page"`, shown via iframe, excluded from the main component grid.
- **v9**: catalog entry with `runnable: false` and a `note` explaining the real source wasn't captured; detail page shows the note + the snippet, no live render attempt.

## Gallery Behavior

- Home page: card grid, one card per runnable component (name, one-line description, category/family badges), search box, category filter.
- Detail page: renders the live component centered on a neutral stage, a light/dark background toggle for previewing, and a collapsible source-code panel (syntax highlighted, copy button) pulling from the actual `index.tsx` file at build time (via `?raw` import).
- Each detail route wrapped in a React ErrorBoundary so a single broken/heavy component (three.js, canvas, opentype.js) can't take down the whole gallery.
- Full-page showcase gets its own nav entry, opens the iframe page instead of the standard detail layout.

## Dependencies

react, react-dom, react-router-dom, typescript, tailwindcss + postcss + autoprefixer, styled-components, framer-motion, clsx, tailwind-merge, lucide-react, three, opentype.js, lenis.

## Verification

- `npm install && npm run dev` in `library/` must start clean with no build errors.
- Spot-check in browser (via claude-in-chrome) a representative spread: a styled-components one (theme-switch), a Tailwind/framer one (magnetic-dock), the three.js-adjacent one if applicable, and opentype.js signature — confirm they render and interact without console errors.
- Confirm the koisei-landing iframe loads and no analytics/tracking network calls fire (check via read_network_requests).
- Confirm v9's reference-only entry shows correctly and does not attempt a live render.

## Out of Scope

- Publishing/deploying the gallery anywhere.
- Rewriting components' visual design or fixing unrelated bugs in their original logic.
- Splitting v2 into separate reusable sub-components (kept as one full-page showcase per user decision).
