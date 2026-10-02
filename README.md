# SAO MC Interactive Map

Static fan-made SAO MC reference website hosted on GitHub Pages.

## Project Goals

- Keep the site fully static and GitHub Pages compatible.
- Preserve fast load times for large content datasets.
- Keep page behavior predictable and easy to extend.
- Make data updates possible without rewriting runtime logic.

## Architecture Overview

- `index.html`: Hub entry for all game modules.
- `Aincrad/`: Aincrad feature pages (Map, Quests, Bestiary, Commands, eCompendium, Patchnotes, Misc Info, Character Build).
- `Fractured Underworld/`: Underworld pages (Main UI map, Tower Defense, Compendium).
- `GunGaleOnline`: not yet a project directory (the game mode is unreleased); its hub card is intentionally locked and tagged "Not released".
- `shared/`: Cross-page runtime utilities and UI layers:
  - `sao-storage.js`, `sao-i18n.js`, `sao-content-translations.js`, `sao-datasets.js`: storage, localization and Current/Beta dataset selection.
  - `sao-page-helpers.js`: HTML escaping, id slugging, `?floor=` parsing, storage fallback and i18n wrappers shared by every feature page.
  - `sao-page-utils.js`: navigation utilities (`window.SAOPageUtils`): the section route map, floor-aware section URLs, the safe internal-href resolver and the shared nav-button wiring.
  - `sao-map-helpers.js`: helpers shared by both interactive map controllers (bounded caches, hex-colour utilities, mob-area centres, marker icon markup, the shared zoom domain, letterbox pointer geometry, initial view state, and the progressive waypoint-clustering maths).
  - `map-runtime.js`, `sao-walkthrough.js`, `sao-dropdown.js`, `sao-runtime-utils.js`, `sao-polish.js`/`.css`, `sao-map-ui.css`, `aincrad-ui.css`: shared runtime and styling layers. `sao-map-ui.css` owns the map chrome, marker colours, controls and responsive rules that the Aincrad and Fractured Underworld maps declare identically; each map page loads it before its own stylesheet, so page-specific rules still win.
- `assets/`: Shared SEO/social assets (icons and preview image).
- `scripts/`: Project tooling, including sitemap generation, localization validation, and regression tests.
- `docs/`: Long-form reference documents - `MAP-ADAPTER-CONTRACT.md` and `PERSISTENCE-CONTRACT.md` (the contracts the map adapters and the storage layer implement) and `character-build-beta-audit.json` (regenerated with `scripts/generate-character-build-audit.js`).

## Runtime Conventions

- Every feature page owns its local rendering logic in its own `*.js` file.
- Cross-page helpers belong in `shared/`.
- Page-level conveniences come from `shared/sao-page-helpers.js` (`window.SAOPageHelpers`) instead of being re-declared per page: `escapeHtml`, `slugifyContentId`, `getRequestedFloor`, `getStorage`, `createTranslators`.
- Helpers both map controllers need identically come from `shared/sao-map-helpers.js` (`window.SAOMapHelpers`).
- Marker artwork both map controllers render (biome, dungeon, boss, side-quest, alchemist, lumberjack, mob-area, market and craftsman icons) comes from `MARKER_ICON_LIBRARY`/`buildMarkerIcon` in that same module; controllers own only which kind a marker gets.
- Styling both map pages share comes from `shared/sao-map-ui.css`, which each map page links before its own stylesheet.
- Floor-specific content stays in floor data files (`*_floor1.js`, etc.).
- Current Data vs Beta Data stays separated: `*_current.js` holds Current Data, the `*_floor*.js` files hold Beta data.
- Navigation buttons should route through `window.SAOPageUtils` (`shared/sao-page-utils.js`).
- Dynamically injected floor scripts should use `window.SAORuntimeUtils.loadTaggedScriptOnce`.

## SEO and Deployment

- `robots.txt`, `sitemap.xml`, `site.webmanifest`, and `.nojekyll` are committed for GitHub Pages indexing.
- Canonical and social metadata are defined per page in each HTML `<head>`.
- Social preview image is `assets/images/social-preview.png`.

## Updating the Sitemap

Run from workspace root:

```powershell
./scripts/generate-sitemap.ps1
```

Optional base URL override:

```powershell
./scripts/generate-sitemap.ps1 -BaseUrl "https://example.com"
```

## Running the Regression Suite

Run every Node regression test plus the localization audit from the workspace root:

```powershell
npm test
```

Individual suites live in `scripts/`:

- `test-persistence.js`, `test-coordinates.js`: protected storage and coordinate behaviour.
- `test-rendering.js`, `test-map-runtime.js`, `test-map-adapter.js`, `test-underworld-adapter.js`, `test-clustering.js`: map rendering, projection, the shared waypoint-clustering and viewport-grid maths, and adapter contracts.
- `test-walkthrough.js`: shared walkthrough controller.
- `test-navigation-resolver.js`, `test-page-lifecycle.js`: link safety and listener/RAF ownership.
- `test-shared-runtime-helpers.js`, `test-shared-map-ui.js`: the shared map runtime helpers, the shared marker icon library, the shared mob-area list markup, and the shared map stylesheet (guards against the two map pages re-forking the same UI).
- `test-localization-render-path.js`, `check-localization.js`: render-path and coverage audit.
- `test-character-build-*.js`, `test-equipment-data-quality.js`, `test-ecompendium-performance.js`, `generate-character-build-audit.js`.

`harness-helpers.js` is the shared scaffolding those scripts require (repo-relative file reads, VM script loading, fake DOM/classList/style stubs, PNG dimensions, URL description and Playwright page diagnostics). It is not a suite on its own.

Browser-level checks (`test-walkthrough-pages.js`, `test-character-build-stats-ui.js`, `test-character-build-picker.js`, `test-settings-menu.js`, `test-cluster-wheel.js`, `test-miscinfo-navigation.js`, `test-fu-navigation.js`, `test-map-image-runtime.js`, `equipment-render-check.js`, `verify-ui-polish.js`, `visual-quality-inspection.js`, `profile-pages.js`) need a static server on `http://127.0.0.1:8080`.

`run-browser-tests.js` orchestrates those scripts and starts (or reuses) the static server itself:

- `npm run test:browser` — walkthroughs, clustering, navigation resolution, map image runtime, character build picker, settings menu, equipment render.
- `npm run test:smoke` — every page in en/es/fr at five viewports with a zero-console-error / zero-failed-request / no-clipping guardrail (`test-browser-smoke.js`).
- `npm run test:ui` — the layout-polish guards plus the visual quality inspection.

On-demand diagnostics (not part of `npm test`):

- `audit-ui-strings.js`: scans every page HTML/JS for user-facing strings that bypass the localization system (`data-i18n` / `SAOI18n.t`).
- `audit-equipment-stats.js`: equipment stat model used by `test-equipment-data-quality.js`.
- `count-equipment-data.js`: prints per-floor eCompendium item counts.
- `measure-map-performance.js`: times map initialization/interaction against a running server.
- `optimize-png.js`: analyses and re-encodes PNG assets (`sharp`).

## Checking Localization Coverage

Run the content inventory and translation coverage diagnostic from the workspace root:

```powershell
node ./scripts/check-localization.js
```

Add `--verbose` to print the complete missing-key lists.

## Checking Persistence Behavior

Run the persistence regression guard from the workspace root:

```powershell
node ./scripts/test-persistence.js
```

The test locks in the current browser storage fallback order, compatibility keys, and persisted quest/marker behavior without changing any runtime storage logic.

## Checking Coordinate Behavior

Run the protected map coordinate regression test from the workspace root:

```powershell
node ./scripts/test-coordinates.js
```

The test evaluates the existing coordinate implementation, loads the real map datasets and PNG dimensions, and checks raw/game round trips plus representative marker and waypoint coordinates.

## Extension Guidelines

- New map-like page:
  - Add page HTML/CSS/JS in a dedicated folder.
  - Add floor data files if needed.
  - Add nav route in page-level routing helpers.
  - Add page metadata (title, description, canonical, OG, Twitter, JSON-LD).
  - Ensure page is included in sitemap generation.

- New language:
  - Add entries inside `shared/sao-i18n.js` dictionaries.
  - Keep key names stable across languages.

- New shared utility:
  - Add to `shared/` and expose a single namespaced global (avoid many globals).

## Non-Goals

- No server-side rendering.
- No runtime dependencies on backend APIs.
- No framework migration unless there is a measurable maintenance benefit.
