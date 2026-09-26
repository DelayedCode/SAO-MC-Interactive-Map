# Map Adapter Contract

The map adapters define the world-specific contract consumed by the page controllers and shared map runtime.

## Adapter owns

- `defaultFloor`, `floors`, and category definitions.
- Context-filtered `getContextData(contextId)` results containing `markerDataset`, `mobAreaDataset`, and `mobAreaMobLookup`.
- `mapImageSources` and `assetAvailability`, including intentional placeholder entries.
- `mapLabels` and world-specific navigation/walkthrough metadata.
- `categoryFloorRules` when category controls are only valid for particular contexts.
- `supportsVisitedCategory(category)`, which explicitly defines whether a marker category can expose visited state.

Adapters may expose empty datasets and unavailable assets when repository data does not exist. They must not fabricate or copy data from another world.

## Controller owns

- Page-specific HTML behavior, marker DOM, icons, CSS classes, info panels, filtering details, and mob-area presentation.
- Page-specific coordinate projection, inverse-coordinate use, image transforms, viewport culling, and rendering caches.
- Page-specific navigation handling where route semantics differ.

The Aincrad and Underworld renderers therefore remain separate. Controllers consume adapter capabilities but do not read raw `DATA`, `MOB_AREAS`, or `MOB_AREA_MOBS` globals directly.

## Shared runtime owns

- Generic map state and lifecycle disposal.
- Category/search state, selection, persistence compatibility, URL-state serialization, and coordinate dependency plumbing.
- Shared pan/zoom and sidebar infrastructure that does not require world knowledge.

The shared runtime remains world-neutral and contains no floor, island, category, asset, or coordinate dataset names.

## Protected coordinate boundary

Coordinate formulas, calibration values, coordinate datasets, conversion direction, floor/context IDs, marker IDs, and waypoint IDs remain outside the adapter contract and are unchanged. Coordinate calculations stay page-owned and remain the source of truth.
