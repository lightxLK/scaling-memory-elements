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
      catalog.ts                # auto-built manifest — see "Catalog Generation" below
      components/
        theme-switch/{index.tsx, meta.ts}
        profile-card/{index.tsx, ProfileCard.css, meta.ts}
        ... one folder per slug, meta.ts required in every folder ...
      App.tsx                   # sidebar/grid layout, react-router
      pages/
        Home.tsx                # grid of cards, filter by category/family/search
        ComponentDetail.tsx     # live render (ErrorBoundary) + source/code panel
        FullPageShowcase.tsx    # iframe wrapper for koisei-landing.html
  docs/superpowers/specs/...
```

### Catalog Generation

`catalog.ts` is not hand-maintained. It's built from `import.meta.glob`:

```ts
const metas = import.meta.glob('./components/*/meta.ts', { eager: true });
const components = import.meta.glob('./components/*/index.tsx');       // -> React.lazy source
const sources = import.meta.glob('./components/*/index.tsx', { as: 'raw' }); // -> source-panel text
```

Adding a new component later means adding a folder with `index.tsx` + `meta.ts` — no other file needs editing.

### Component Metadata (`meta.ts`, one per folder)

```ts
interface ComponentMeta {
  slug: string;
  name: string;
  description: string;       // one line, shown on the card
  category: Category;        // fixed enum, see below
  tags: string[];
  family: 'react-bits' | 'componentry' | 'misc' | 'full-page';
  deps: string[];             // npm packages this component needs
  runnable: boolean;          // false only for v9 (scroll-split-card)
  previewHeight?: number;      // px, default stage height if the component needs more/less than default
  background?: 'light' | 'dark' | 'transparent'; // stage background this component looks right on
  scrollable?: boolean;        // true only for scroll-driven demos (see "Preview Stage")
  notes?: string;              // e.g. v9's "source not captured" explanation
}
```

No `author`/`license`/`difficulty` fields — these are scraped third-party snippets with no license metadata to track, and difficulty isn't a decision this library needs to make.

### Category Taxonomy (fixed enum, not free-form strings)

`Hover | Cards | Navigation | Scrolling | Typography | Cursor | Motion | 3D | Toggle | Showcase`

Each of the 16 entries gets mapped to exactly one of these at port time.

## Per-Component Porting Rules

- **v1, v3, v4, v5, v7, v10–v16**: move as-is into their slug folder; only path/import touch-ups.
- **v6**: strip ~70 lines of scraped Lightswind marketing/nav chrome; keep the component; point its `cn` import at `@/lib/utils`.
- **v8**: swap `@workspace/ui/lib/utils` (monorepo-only, unresolvable) for `@/lib/utils`.
- **v2**: strip embedded Google Analytics (`gtag`) and the "aura-preview-performance-controller" sandbox script; keep the rest verbatim as a static HTML file; catalog it as `family: "full-page"`, shown via iframe, excluded from the main component grid.
- **v9**: catalog entry with `runnable: false` and a `note` explaining the real source wasn't captured; detail page shows the note + the snippet, no live render attempt.
- **Every ported file**: scan for global CSS selectors (bare `body`, `html`, `*`, unscoped tag selectors like `button {}`) that would leak into the rest of the gallery. Scope them to the component's root class or remove if not essential to the effect. Known suspect: v6 (scraped page chrome likely carried some page-level rules).
- **Every ported file with `useEffect`/animation loops**: audit for missing cleanup — cancel `requestAnimationFrame`, remove event listeners, dispose Three.js renderers/geometries, destroy Lenis instances, kill GSAP timelines — on unmount. Add cleanup where the original snippet omitted it (react-router will mount/unmount these repeatedly as the user browses). Known candidates to check closely: `cursor-particle-typography` (canvas/RAF), `signature` (opentype/SVG animation), `magnetic-dock` (mouse listeners), `sticky-scroll-cards` (Lenis).
- Install only the npm dependencies actually required by the ported components — don't add packages "for completeness."

## Gallery Behavior

- Home page: card grid, one card per runnable component (name, one-line description, category/family badges). No pre-rendered thumbnails — see "Rejected: thumbnails" below.
- Search matches against name, slug, tags, and description. Category filter uses the fixed taxonomy above. Default sort: alphabetical by name.
- Detail page: renders the live component on a neutral stage using each component's `previewHeight`/`background` (defaults if unset), a light/dark toggle, a **Restart** button that remounts the component (changing its React `key`) to replay entrance/one-shot animations, and a collapsible source-code panel (syntax highlighted, copy button) pulling from the actual `index.tsx` file at build time (via the glob-based raw import from "Catalog Generation").
- Components load via `React.lazy` + `Suspense` (not all imported eagerly on first paint) — matters for the heavier ones (three.js, opentype.js).
- Each detail route wrapped in a React ErrorBoundary. On crash it shows "Component crashed: `<slug>`" with the error message and a Retry button (resets the boundary + remounts), so a single broken/heavy component can't take down the whole gallery.
- Full-page showcase gets its own nav entry, opens the iframe page instead of the standard detail layout.

### Rejected: thumbnails/screenshots

Considered generating preview thumbnails for the home grid, but this is a live-preview gallery by explicit choice — the point is clicking through to see it run, not judging a static image. Real thumbnails would need a headless-screenshot build step (Puppeteer or similar), which is disproportionate infra for 16 items. Revisit only if the library grows into the hundreds.

### Preview Stage

Default stage: `min-height: 650px`, flex-centered, `padding: 40px`, `overflow: hidden`, background per the component's `background` meta field (default light).

Exception: components whose effect depends on page scroll (`sticky-scroll-cards`, `collection-surfer`) render inside a stage with `overflow-y: auto` and a taller inner scroll track instead — `overflow: hidden` would break the effect entirely. This is a per-component override via `previewHeight`/a `scrollable: true` flag on `meta.ts` for just those two, not a global stage change.

## Dependencies

react, react-dom, react-router-dom, typescript, tailwindcss + postcss + autoprefixer, styled-components, framer-motion, clsx, tailwind-merge, lucide-react, three, opentype.js, lenis.

## Asset Handling

None of the 16 files bundle local binary assets today (v3's avatar is a URL prop passed by the consumer; v2's images/video are hardcoded external URLs kept as-is). Fallback rule for if a ported component does turn out to need a local image/font/svg: place it in `assets/` inside that component's folder (e.g. `profile-card/assets/noise.png`) and reference it with a relative import. No upfront asset pipeline needed since nothing currently requires one.

## Verification

- `npm install && npm run build` in `library/` must succeed with no errors (build, not just dev server — catches things `dev` mode tolerates).
- `npm run dev`, then for every runnable route: loads without a thrown error, no console errors/warnings during initial render or during its animation/interaction.
- Leak spot-check: navigate into and away from `cursor-particle-typography`, `signature`, `magnetic-dock`, and `sticky-scroll-cards` a few times in a row; confirm no growing pile of duplicate RAF loops / listeners (rough manual check, not automated profiling).
- Confirm the koisei-landing iframe loads and no analytics/tracking network calls fire (check via read_network_requests).
- Confirm v9's reference-only entry shows correctly and does not attempt a live render.
- Confirm Restart button replays entrance animations and the ErrorBoundary's Retry button actually recovers a deliberately-broken test case.

Not included: linting (not configured in this spec, not worth adding just to satisfy a checklist) and hydration-warning checks (this is a Vite SPA with no SSR, so hydration doesn't apply).

## Out of Scope

- Publishing/deploying the gallery anywhere.
- Rewriting components' visual design or fixing unrelated bugs in their original logic.
- Splitting v2 into separate reusable sub-components (kept as one full-page showcase per user decision).
