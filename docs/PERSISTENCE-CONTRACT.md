# Persistence Contract

Status: audit baseline only. This document describes the current repository behavior as of 2026-09-22. It does not authorize key renames, format changes, migrations, deletion, or storage refactoring.

## Scope and Storage Model

The site is static and has no server-side user account or remote persistence. Persistent browser state is normally accessed through `window.SAOStorage` from [shared/sao-storage.js](../shared/sao-storage.js).

`SAOStorage` behavior is:

1. `getItem(key)` first reads `localStorage`. A non-null value wins.
2. If localStorage throws or returns `null`, it reads a cookie with the same logical key.
3. If the cookie read throws or has no value, it reads the module's in-memory `Map`.
4. `setItem(key, value)` writes to localStorage and stops on success. Otherwise it writes a five-year, root-path, `SameSite=Lax` cookie and stops on success. Otherwise it writes to the in-memory `Map`.
5. `removeItem(key)` attempts to remove localStorage, the cookie, and the in-memory value independently.
6. `getJSON` parses a stored string and returns its supplied fallback for missing or invalid JSON. `setJSON` serializes with `JSON.stringify`.

The fallback layers are not synchronized. A value written to a cookie is not also written to localStorage, and the in-memory fallback lasts only for the current page JavaScript context. `SAOStorage` performs no migration, versioning, schema validation, or key aliasing.

There is no `sessionStorage` usage in the repository. Direct cookie access exists only inside `SAOStorage`. Direct localStorage access outside `SAOStorage` is documented below.

## Key Inventory

### `sao.global.settings`

- **Purpose:** Global website settings, currently including language and the settings structure's default preference fields.
- **Written by:** `saveSettings()` in [shared/sao-i18n.js](../shared/sao-i18n.js), through `storage.setJSON()`.
- **Read by:** `getSettings()` in [shared/sao-i18n.js](../shared/sao-i18n.js), through `storage.getJSON()` during i18n initialization.
- **Shape:** JSON object. Current defaults are:
  - `language`: `"en"`, constrained to `en`, `es`, or `fr`.
  - `theme`: `"system"`.
  - `animations`: `"default"`.
  - `accessibility`: `"default"`.
  - `fontSize`: `"default"`.
  - `notifications`: `"default"`.
  Unknown stored properties are merged forward by `Object.assign`.
- **User-facing:** Yes. Language is active across pages; the other fields are part of the persisted settings contract even where current UI use is limited.
- **Legacy compatibility:** Invalid or unsupported language values fall back to English. No explicit migration exists.
- **Data-loss risk:** High. Renaming the key or replacing the object without preserving unknown fields could lose language and future/user settings.
- **Future handling:** **KEEP**. Any schema change should be additive and versioned or explicitly migrated.

### `sao.completedQuests`

- **Purpose:** Quest completion tracking.
- **Written by:** `saveCompletedQuests()` in [Aincrad/Quests/quests.js](../Aincrad/Quests/quests.js), through `setPersistentItem()`.
- **Read by:** `loadCompletedQuests()` in the same file.
- **Shape:** JSON array of strings stored with `JSON.stringify`.
- **Current keys in the array:** New entries use `dataset + "|" + getQuestId(entry)`, where dataset is `beta` or `current`. The current dataset-aware ID is derived from `entry.id`, or a slug of NPC, city, coordinates, and quest name.
- **Legacy compatibility:** `isQuestCompleted()` also recognizes the old composite string `npcName|city|coordinates|questName`. Unchecking a quest removes that legacy key when the entry is available. This is the only discovered quest-state compatibility path.
- **User-facing:** Yes. It represents explicit user progress.
- **Data-loss risk:** Very high. Changing quest IDs, dataset identifiers, field normalization, or the legacy lookup can make existing completions appear lost.
- **Future handling:** **KEEP**. Preserve both formats until a deliberate, tested migration exists.

### `sao.quests.uiState`

- **Purpose:** Quest search persistence.
- **Written by:** `saveQuestUiState()` in [Aincrad/Quests/quests.js](../Aincrad/Quests/quests.js).
- **Read by:** `loadQuestUiState()` in the same file.
- **Shape:** JSON object containing `searchByFloor`, an object mapping `floor1`, `floor2`, or `floor3` to search strings. Unknown properties are retained when the search is updated.
- **Legacy compatibility:** None found.
- **User-facing:** Yes, but low-risk UI preference rather than game progress.
- **Data-loss risk:** Low to moderate. Users would lose saved quest searches, not completion data.
- **Future handling:** **MIGRATE LATER** if UI state is consolidated; preserve floor-specific searches during migration.

### `sao.visitedMarkers`

- **Purpose:** Visited/defeated/completed marker state for map pages.
- **Written by:** `persistVisitedMarkers()` in [Aincrad/Map/maps.js](../Aincrad/Map/maps.js) and [Fractured Underworld/Main UI/mainui.js](../Fractured%20Underworld/Main%20UI/mainui.js).
- **Read by:** `loadVisitedMarkers()` in both map runtimes.
- **Shape:** JSON array of strings.
- **Current representation:** New entries are floor-aware strings in the form `floorOrIsland:id`, generated by `getVisitedMarkerKey()`.
- **Legacy compatibility:** `isMarkerVisited()` also checks the raw marker ID without a floor prefix. When marking a marker visited, the new floor-aware key is added and the raw ID is removed. The shared key means the two map runtimes can see the same array, although their marker namespaces and floor values differ.
- **User-facing:** Yes.
- **Data-loss risk:** High. Renaming marker IDs, changing floor identifiers, or discarding raw IDs could alter existing visited state.
- **Future handling:** **KEEP** until a namespace and migration policy are explicitly defined.

### `sao.sidebar.width`

- **Purpose:** Persisted map sidebar width.
- **Written by:** Sidebar resize stop and reset handlers in both [Aincrad/Map/maps.js](../Aincrad/Map/maps.js) and [Fractured Underworld/Main UI/mainui.js](../Fractured%20Underworld/Main%20UI/mainui.js).
- **Read by:** Map initialization in both runtimes.
- **Shape:** Numeric text string, rounded to a whole pixel; accepted only when finite and positive, then clamped by the page's local min/max configuration.
- **Legacy compatibility:** None found.
- **User-facing:** Yes, as layout preference.
- **Data-loss risk:** Low. Loss resets the sidebar to the page default width.
- **Future handling:** **MIGRATE LATER** if map UI state is consolidated; preserve a valid width where possible.

### `sao.map.uiState`

- **Purpose:** Persisted map filter and selection state.
- **Written by:** `persistStateToHistory()` in both map runtimes, through `saveMapUiState()`.
- **Read by:** `loadMapUiState()` during initialization in both map runtimes.
- **Shape:** JSON object with:
  - `floor`: selected Aincrad floor or Underworld island key.
  - `underground`: boolean.
  - `search`: string.
  - `activeCategories`: object of category names to booleans.
- **Related non-storage state:** The same map state is also placed in `history.state.mapState` and encoded into the URL by the map runtime. URL/history state takes precedence over stored state when URL parameters are present.
- **Legacy compatibility:** None found.
- **User-facing:** Yes, as map navigation/filter state.
- **Data-loss risk:** Moderate. Loss resets filters and search; changing category or floor identifiers can produce partial state loss or invalid selections.
- **Future handling:** **MIGRATE LATER** only with separate schemas for Aincrad and Underworld, because both pages share this key but use different floor value domains.

### `sao.bestiary.uiState`

- **Purpose:** Bestiary tab and search state.
- **Written by:** `saveBestiaryUiState()` in [Aincrad/Bestiary/bestiary.js](../Aincrad/Bestiary/bestiary.js).
- **Read by:** `loadBestiaryUiState()` in the same file.
- **Shape:** JSON object keyed by floor, with per-floor `{ category, search }` values. Unknown top-level properties are retained when updating a floor.
- **Legacy compatibility:** None found.
- **User-facing:** Yes, low-risk UI preference.
- **Data-loss risk:** Low to moderate. Loss resets tab and search choices.
- **Future handling:** **MIGRATE LATER** if page UI state is standardized.

### `sao.compendium.uiState`

- **Purpose:** Equipment Compendium tab and search state.
- **Written by:** `saveCompendiumUiState()` in [Aincrad/eCompendium/ecompendium.js](../Aincrad/eCompendium/ecompendium.js).
- **Read by:** `loadCompendiumUiState()` in the same file.
- **Shape:** JSON object keyed by floor, with per-floor `{ category, search }` values. Unknown top-level properties are retained.
- **Legacy compatibility:** None found.
- **User-facing:** Yes, low-risk UI preference.
- **Data-loss risk:** Low to moderate. Loss resets category and search.
- **Future handling:** **MIGRATE LATER** if page UI state is standardized.

### `sao.commands.uiState`

- **Purpose:** Commands category and search state.
- **Written by:** `saveCommandsUiState()` in [Aincrad/Commands/commands.js](../Aincrad/Commands/commands.js).
- **Read by:** `loadCommandsUiState()` in the same file.
- **Shape:** JSON object with `category` and `search` strings. Unknown properties are retained.
- **Legacy compatibility:** None found.
- **User-facing:** Yes, low-risk UI preference.
- **Data-loss risk:** Low. Loss resets category and search.
- **Future handling:** **MIGRATE LATER** if page UI state is standardized.

### `sao.patchnotes.search`

- **Purpose:** Patchnotes filter text.
- **Written by:** Input handler in [Aincrad/Patchnotes/patchnotes.js](../Aincrad/Patchnotes/patchnotes.js).
- **Read by:** Page initialization in the same file.
- **Shape:** Plain string.
- **Legacy compatibility:** None found.
- **User-facing:** Yes, low-risk UI preference.
- **Data-loss risk:** Low. Loss clears the filter.
- **Future handling:** **MIGRATE LATER** or retain as-is; no removal without verifying users do not depend on it.

### `sao.walkthrough.index.completed`

- **Purpose:** Completion marker for the Welcome Mat walkthrough.
- **Written by:** Inline `startGuidedWalkthrough()` in [index.html](../index.html), with value `"1"` when skipped, dismissed, or finished.
- **Read by:** The same inline walkthrough before auto-starting.
- **Shape:** Plain string, expected value `"1"`.
- **Legacy compatibility:** No alternate key found.
- **User-facing:** Yes. It suppresses automatic walkthrough display.
- **Data-loss risk:** Low to moderate. Loss causes the walkthrough to replay.
- **Future handling:** **KEEP** until walkthrough ownership is redesigned.

### `sao.walkthrough.characterBuild.completed`

- **Purpose:** Completion marker for the Aincrad Character Build walkthrough.
- **Written by:** The shared walkthrough controller initialized in [Aincrad/Character Build/character-build.js](../Aincrad/Character%20Build/character-build.js).
- **Read by:** The same page before automatically starting the walkthrough.
- **Shape:** Plain string, expected value `"1"`.
- **User-facing:** Yes. It suppresses automatic walkthrough display after completion or skip.
- **Future handling:** **KEEP** with the other walkthrough completion keys.

### `sao.walkthrough.maps.completed`

- **Purpose:** Completion marker for the Aincrad Map walkthrough.
- **Written by:** `startGuidedWalkthrough()` in [Aincrad/Map/maps.js](../Aincrad/Map/maps.js).
- **Read by:** The same function.
- **Shape:** Plain string, expected value `"1"`.
- **Legacy compatibility:** No alternate key found.
- **User-facing:** Yes.
- **Data-loss risk:** Low to moderate. Loss causes replay.
- **Future handling:** **KEEP** until walkthrough behavior is deliberately consolidated.

### `sao.walkthrough.mainui.completed`

- **Purpose:** Completion marker for the Fractured Underworld Main UI walkthrough.
- **Written by:** `startGuidedWalkthrough()` in [Fractured Underworld/Main UI/mainui.js](../Fractured%20Underworld/Main%20UI/mainui.js).
- **Read by:** The same function.
- **Shape:** Plain string, expected value `"1"`.
- **Legacy compatibility:** No alternate key found.
- **User-facing:** Yes.
- **Data-loss risk:** Low to moderate. Loss causes replay.
- **Future handling:** **KEEP** until walkthrough behavior is deliberately consolidated.

## Dataset Selection and Other State

The active dataset is not persisted in browser storage. [shared/sao-datasets.js](../shared/sao-datasets.js) reads the `dataset` URL query parameter and accepts only `beta` and `current`; navigation preserves that parameter for affected sections. There is no dataset storage key and no dataset migration.

Map state also uses URL query parameters and `history.state.mapState`. These are navigation/history state, not durable storage keys. They must still be preserved when changing map URL handling because they can override stored map state and determine the visible floor, search, underground mode, and categories.

The Welcome Mat has no additional user-state key beyond its walkthrough completion key and the global settings mounted by shared i18n.

## Direct Storage Access Classification

### Direct `localStorage`

- [shared/sao-storage.js](../shared/sao-storage.js): **A. Must remain direct.** This is the implementation's primary backend and must directly access the browser API.
- [shared/sao-i18n.js](../shared/sao-i18n.js), the fallback `storage` object at module startup: **C. Legacy compatibility that should remain temporarily.** It is used only when the shared storage module was not loaded and provides localStorage-only reads/writes; normal HTML pages load `sao-storage.js` first.
- [shared/sao-i18n.js](../shared/sao-i18n.js), `resetWalkthroughProgress()`: **D. Potential bug or inconsistent behavior.** It directly removes the three walkthrough keys instead of calling `SAOStorage.removeItem()`. Cookie-backed or memory-backed values may remain, and localStorage exceptions are handled without clearing fallback layers.
- [Aincrad/Quests/quests.js](../Aincrad/Quests/quests.js), fallback branches in `getPersistentItem()` and `setPersistentItem()`: **C. Legacy compatibility that should remain temporarily**, pending a deliberate decision about behavior when `SAOStorage` is unavailable. Normal page loading provides `SAOStorage` first, so these branches are fallback compatibility rather than the primary path.
- [scripts/check-localization.js](../scripts/check-localization.js): **E. Not actually persistent user state.** The VM test harness supplies a stub localStorage object so shared i18n can be analyzed under Node.

No direct `localStorage` use was found in the page modules outside these cases.

### `sessionStorage`

No references were found. There is no session-storage contract.

### Cookies

Only `SAOStorage` reads, writes, and removes cookies. Cookie names represent the same logical keys as the storage API after URL encoding. They are root-path, five-year, `SameSite=Lax` cookies without an explicit `Secure` attribute.

### In-memory fallback

The private `memoryStore` `Map` in `SAOStorage` is used only when localStorage and cookie operations fail. It is not shared across tabs, windows, or page reloads. It provides temporary same-page continuity only. There is no separate memory-state key namespace.

## Walkthrough Restart Status

The current implementation is partially wired:

- The settings menu is mounted only on the Welcome Mat by `isDoormatPage()` in [shared/sao-i18n.js](../shared/sao-i18n.js).
- Clicking “Restart walkthrough” calls `resetWalkthroughProgress()`, removes all four walkthrough keys through the storage abstraction, and dispatches `sao:walkthroughrestart`.
- The Welcome Mat, Aincrad Map, Fractured Underworld Main UI, and Character Build register listeners for that event and call `startGuidedWalkthrough({ force: true })`.
- Because reset bypasses `SAOStorage`, cookie-backed or memory-backed completion values may still be readable after the reset attempt.

This is an existing incomplete behavior, documented for a future unit. It is intentionally not fixed here.

## Existing Migrations and Compatibility

No general storage migration framework, schema version, key alias table, or one-time migration routine exists.

The discovered compatibility behaviors are:

- Quest completion reads both dataset-aware IDs and legacy composite IDs.
- Map visited state reads both floor-aware IDs and raw marker IDs.
- `SAOStorage` provides backend fallbacks, but not data migration.
- Settings merge stored properties into defaults and repair invalid language values, but do not migrate schemas.
- JSON readers fall back on malformed data rather than repairing or deleting it.

These behaviors must be preserved or explicitly tested before any storage cleanup.

## Future Unit Guidance

1. First define tests around `SAOStorage` backend fallback behavior and the exact quest/marker compatibility formats.
2. Then decide whether to repair walkthrough reset semantics, including the Welcome Mat listener and fallback-layer clearing, without changing key names.
3. Only after that should direct fallback calls and duplicated UI-state wrappers be considered for consolidation.

No key is classified as safe to remove from this audit. The lowest-risk future candidates are UI preference keys, but they still require reference and user-impact verification before removal.