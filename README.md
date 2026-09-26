# SAO MC Interactive Map

Static fan-made SAO MC reference website hosted on GitHub Pages.

## Project Goals

- Keep the site fully static and GitHub Pages compatible.
- Preserve fast load times for large content datasets.
- Keep page behavior predictable and easy to extend.
- Make data updates possible without rewriting runtime logic.

## Architecture Overview

- `index.html`: Hub entry for all game modules.
- `Aincrad/`: Aincrad feature pages (Map, Quests, Bestiary, Commands, Compendium, Patchnotes, Misc Info).
- `Fractured Underworld/`: Underworld pages (Main UI map and Tower Defense).
- `shared/`: Cross-page runtime utilities (`sao-storage.js`, `sao-i18n.js`, `sao-runtime-utils.js`).
- `assets/`: Shared SEO/social assets (icons and preview image).
- `scripts/`: Project tooling, including sitemap generation, localization validation, and regression tests.

## Runtime Conventions

- Every feature page owns its local rendering logic in its own `*.js` file.
- Cross-page helpers belong in `shared/`.
- Floor-specific content stays in floor data files (`*_floor1.js`, etc.).
- Navigation buttons should route through `window.SAOPageUtils`.
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
