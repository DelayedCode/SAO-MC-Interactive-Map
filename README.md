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
  - `sao-argo-engine.js`: Argo's data engine (`window.SAOArgoEngine`). Answers a question from the site's own **Current Data** records - Bestiary, equipment, map markers, mob areas, quests and the Underworld questline - and returns structured facts plus a status (`answer`, `ambiguous`, `missing`, `unsupported`), the matched entity, match quality and data-quality notes. A question is first turned into a _plan_: a single-record lookup, a **collection** ("show me all side quests", "all occult gear"), a **ranking** ("which weapon has the highest attack", "sort quests by experience, highest to lowest"), a **comparison** ("compare training bow and training sword") or a **farming** question ("where can I farm Sylvan Bark"). Planning understands synonyms (xp/exp/experience, loot/drops), common abbreviations (atk, dmg, def, hp, wep, mats), one-edit typos and the Spanish and French cue words Argo understands (her parser deliberately covers English, Spanish and French, and is separate from the site's supported-language list); record names are still matched against the datasets' own spelling. Collections return every match in scope, with the count and any display cap stated; filters (category, quest type, keyword, level range, numeric stat threshold) and rankings only ever read fields the relevant records really have, and a value that is not recorded stays unknown rather than becoming a zero or a guess. It never invents a stat, drop rate, recipe, coordinate or reward, reads only the data globals the page already loaded (it never injects scripts, because the map datasets are top-level `const`s that cannot be redeclared), and holds no storage or network dependency. Beta-Test Data is recognised but not supported: nothing is read or indexed while that mode is selected, and the mode is reported as unsupported instead of answering from Current Data or from Beta records. The active floor (or Underworld island) is the default context; a question that names a floor is answered from that floor, a name that only one other floor holds is answered from there with a note, and a set question is always scoped to the active floor or island - records elsewhere are counted and mentioned, never merged in. No dialogue: wording belongs to the UI.
  - `sao-argo-data-provider.js` + `sao-argo-data-frame.js`/`.html`: Argo's cross-page data access (`window.SAOArgoData`). The provider loads the data frame in a hidden sandboxed iframe once per page session; the frame loads the site's real Current-Data files in its own global scope and posts the records back, so no page ever declares a second `DATA`/`MOB_AREA_MOBS` and nothing else on the page can be disturbed. The provider then hands the engine only the active world's Current sources, so an Aincrad page never sees Underworld data and vice versa, and it reports the page's dataset selection per question (`getDatasetHint`) so switching modes while the window is open is honoured. Nothing is persisted, nothing is sent anywhere, and if the frame cannot load the window simply answers from the page's own data.
  - `sao-argo.js`/`sao-argo.css`: Argo the Info Broker's launcher and chat window (`window.SAOArgo`). The window sends a submitted question to `window.SAOArgoEngine` and renders the structured result as readable text - one line per documented fact, the engine's candidate list for an ambiguous match, its data-quality notes for an incomplete record, and a friendly redirect for anything outside her records. Her wording is a set of numbered pools in `shared/sao-i18n.js` (a welcome pool, per-category lead-ins, per-category transitions into the facts, one shared sign-off pool, and per-note and per-outcome pools), each rotated by its own cursor so the same line never lands twice in a row; the cursors live with the conversation and reset when it is cleared, and the module's English fallback table is generated from the English dictionary by `scripts/generate-argo-fallbacks.js` so the two can never drift. Wording is only ever added around the engine's facts: a sign-off is dropped as soon as any caveat is present, a list transition only appears when there is a list to introduce, and no line names a dataset, a file or any other internal. It never adds a fact, never passes a context that could override the active world, dataset or floor, and never turns an unavailable source into an answer. The conversation lives purely in memory (nothing is written to storage, cookies or the network) and closing it starts a fresh greeting. It self-initializes on the feature pages only - the Welcome Mat deliberately does not load Argo - and exposes `ensureLauncher()` for the hub walkthrough's lazy target; the two map pages lift the launcher above their zoom bar from `sao-map-ui.css`.
- `assets/`: Shared SEO/social assets (icons and preview image; `assets/images/MoonlitBlackCats.webp` is Argo's guild image).
- `scripts/`: Project tooling, including sitemap generation, localization validation, and regression tests (`generate-argo-fallbacks.js` regenerates Argo's English fallback table from the English dictionary after a dialogue edit).
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
- `test-argo-engine.js`: Argo's data engine against the real Current-Data datasets (intents, exact/partial/ambiguous matching, incomplete item records, drop-source lookups, spawn-area versus drop separation, the explicit Beta-Test refusal, world/floor/island context, missing globals, malformed records, no persistence, cross-page records, cross-floor context, cross-page isolation, and the Stage 5 groups: question vocabulary - synonyms, abbreviations, typo tolerance and the Spanish/French cue words - collections with their filters and floor scoping, rankings in both directions with unknowns kept out, comparisons with missing fields, farming with unrecorded rates, and set-question scope/isolation).
- `test-argo-data-provider.js`: Argo's cross-page data access (the world-isolation boundary, the per-question dataset hint from the site authority and the Character Build source toggle, graceful degradation without an engine/document/URL, the hidden sandboxed frame lifecycle and token check, the frame's Current-Data-only file plan against the real repository, and no persistence or network in either half of the bridge).
- `test-argo-window.js`: Argo's launcher and chat window (creation, open/close state, dragging and clamping, the closing sphere, conversation clearing, reduced motion, no persistence, localization coverage, the Welcome Mat carrying no Argo at all, the dialogue pools - welcome wording kept separate from answer wording, every pool's size, distinctness, translation and emoji-freedom, rotation without back-to-back repeats, pool resets, caveat gating and the fact that rotating the wording never changes a fact - and the engine integration: per-intent answer rendering, ambiguous candidates, missing and unsupported paths, unavailable sources, a missing or throwing engine, cross-page provider waiting, floor-aware answers, context pass-through, empty input, and the Stage 5 set-question rendering: a collection with its stated total and admitted display cap, a ranking with its field and direction plus the records that have no value, and - in the window's own tests - the comparison and farming bodies).
- `test-navigation-resolver.js`, `test-page-lifecycle.js`: link safety and listener/RAF ownership.
- `test-shared-runtime-helpers.js`, `test-shared-map-ui.js`: the shared map runtime helpers, the shared marker icon library, the shared mob-area list markup, and the shared map stylesheet (guards against the two map pages re-forking the same UI).
- `test-localization-render-path.js`, `check-localization.js`: render-path and coverage audit.
- `test-character-build-*.js`, `test-equipment-data-quality.js`, `test-ecompendium-performance.js`, `generate-character-build-audit.js`.

`harness-helpers.js` is the shared scaffolding those scripts require (repo-relative file reads, VM script loading, fake DOM/classList/style stubs, PNG dimensions, URL description and Playwright page diagnostics). It is not a suite on its own.

Browser-level checks (`test-walkthrough-pages.js`, `test-argo-window-browser.js`, `test-character-build-stats-ui.js`, `test-character-build-picker.js`, `test-settings-menu.js`, `test-cluster-wheel.js`, `test-miscinfo-navigation.js`, `test-fu-navigation.js`, `test-map-image-runtime.js`, `equipment-render-check.js`, `verify-ui-polish.js`, `visual-quality-inspection.js`, `profile-pages.js`) need a static server on `http://127.0.0.1:8080`.

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

- Adding another language (the site ships English, Spanish, French and Italian; Italian is the worked
  example below - it did steps 1, 2, 3 and 6 and deliberately stopped before steps 4 and 5):
  1. Register the language in the shared configuration: add its code to `SUPPORTED_LANGUAGES` in
     `shared/sao-i18n.js`, and to `LANGUAGE_DISPLAY_ORDER` in the same file if the pickers should not
     simply list it last.
  2. Add its UI dictionary in the same file - every key the other languages define, including the
     top-level `languageName` (the selector label) and `languageHint` (the first-visit hint sentence) -
     keeping key names stable across languages. The audit reports every key the new language is missing
     or leaves empty, and the dictionary can be written as one block (`translations.it = deepMerge({},
     {...})`) rather than threaded through every per-language merge above.
  3. Add its classification data for the localization audit in
     `scripts/localization-same-as-english.json`: one status per group per content language. The
     shipped schema writes those as `spanishStatus` / `frenchStatus` fields; the language-keyed
     `statuses` object (`{ "es": "...", "it": "..." }`) is the extensible form and needs no change to
     the audit script. A content language with no status is reported as an invalid classification
     entry rather than being skipped, so a language that is not a content language yet declares
     `"it": "unresolved"` for every group until its content translations land.
  4. Extend the content translations: add the language to `TRANSLATION_SLOT_LANGUAGES` in
     `shared/sao-content-translations.js` and give every positional `[spanish, french, italian]`
     glossary entry its value for the new slot, or migrate those glossaries to a language-keyed
     structure. No reader or producer has to be touched: the module reads every glossary entry through
     `pairValue()` and every producer registers its per-language values through
     `translationsByLanguage()`, both driven by `TRANSLATION_SLOT_LANGUAGES`, so a new slot is picked up
     everywhere at once. An entry that does not carry the new language yet registers the English source
     text for it, so the registry stays complete while the work is in progress; list the language in
     `TRANSLATION_BACKLOG_LANGUAGES` in `scripts/localization-languages.js` until its glossaries are
     finished, and the audit will report its coverage and remaining backlog instead of failing while
     the content tests keep requiring complete translations for the languages that are done. The audit
     then reports the language under its own language code; add a report key in
     `scripts/localization-languages.js` if it should keep a named key like Spanish and French do.
  5. Add the language's own Argo support: cue aliases and question patterns in
     `shared/sao-argo-engine.js` (`LOCALIZED_ALIASES` and the language list the parser iterates) and
     the dialogue pools in `shared/sao-i18n.js`. Argo's parser languages are deliberately separate from
     the site's supported-language list.
  6. Update the tests that carry per-language expectations - for example the bracelet name and set
     tables in `scripts/equipment-render-check.js` - and run the validation below. Everything else (the
     browser smoke matrix, the UI polish and visual checks, the walkthrough and warning tours, the
     settings-menu picker check, the Underworld content check and the audit itself) reads the shared
     configuration through `scripts/localization-languages.js` and picks the language up on its own.

  Until step 4 lands, a UI language with no content-translation slot renders the English source text
  for game content: `shared/sao-content-translations.js` resolves a language it has no slot for to the
  source value, so item names, stats and descriptions stay readable instead of turning blank.

  Then run `node ./scripts/check-localization.js`, `npm test` and `npm run test:all`.

- New shared utility:
  - Add to `shared/` and expose a single namespaced global (avoid many globals).

## Non-Goals

- No server-side rendering.
- No runtime dependencies on backend APIs.
- No framework migration unless there is a measurable maintenance benefit.
