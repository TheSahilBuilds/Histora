# Pratapgad 3D model — required asset location

Place the optimized, web-ready **Pratapgad fort** model here as:

```
public/models/historical/pratapgad/pratapgad.glb
```

(optional) accompanying textures at the same path or Drama/KTX2 extensions as referenced by the GLB.

## How the pipeline uses it

- `data/sites.json` → `"model": "/models/historical/pratapgad/pratapgad.glb"`.
- `components/3d/HistoricalScene.tsx` probes this URL at runtime (HEAD request).
  If it resolves, the scene loads the GLB via `useGLTF` and shows
  `SURVEYING THE FORT...` while it streams; if it does not resolve, the app
  falls back to the **temporary procedural fort** and labels it clearly.
- You only ever replace the file — no code changes needed to swap the asset.

## Asset requirements

- Format: GLB (binary glTF) or glTF with external buffers/textures.
- Optimized for the web: Draco compression is welcome if practical; KTX2/Basis
  compressed textures only if you already produce them.
- Reasonable polycount (low-to-mid detail, e.g. under ~300k triangles), PBR
  textures at sensible resolutions (no 4K/8K-everywhere).
- Prefer a single root node `scene` centered on the summit; the scene camera
  aims at origin (0, ~3, 0) from the south-east (`[24, 13, 30]`).

## Alignment (auto, data-driven)

`components/3d/HistoricalModel.tsx` normalizes the loaded scene using the
`transform` block in `data/sites.json` (no code changes to re-tune):

```jsonc
"transform": {
  "excludePrefixes": ["G-Google Earth Terrain", "G-Google Earth Snapshot"], // drop satellite ground/photo planes
  "targetHeight": 14,      // uniform scale so total model height = 14 scene units
  "rotationY": 180,         // last export: fort reads as a compact walled stronghold from the SE camera; other headings expose the photogrammetry slope-face
  "restOnTerrain": true,   // floor the model base onto the fortress mountain (siteTerrainHeight)
  "embed": 3.55            // bury the raw photogrammetry slab-edge this many units below the mountain crown
}
```

The current model is a Google-Earth photo-grammetry export whose raw bounds were
650×189×705 units offset to (−247, −145, −326). The transform strips the satellite
terrain and photo quads, keeps the fort structure, scales it to a 14-unit-tall,
~29×70-unit fort footprint centered on the summit origin, and embeds it into the
**continuous fortress mountain** (`siteTerrainHeight` in `sceneUtils.ts`). The
crown rises to just below the wall footings (~3.8) everywhere inside the fort, and
a raised rim (≈2.5+) completely covers the raw slab underside around the defensive
terrace, so no floating plates, razor cuts or exposed undersides are visible. The
mountain then falls away as smooth rocky shoulders into the valley. Artifact
towers/textures from the GE capture can look rough when zoomed — bump `rotationY`
or swap in a cleaner hand-built mesh whenever a nicer asset exists.

## Tuning hotspot positions

The hotspot anchors in `data/sites.json` are seeded against the real geometry of
the current export at `rotationY: 180` and `embed: 3.55` (fort mass x −13..13,
z −35..35; front gate-opening gap around x 7–8; tall east wall ≈ 8.7; summit
tower ≈ 13.6; east ridge at ≈ y 3.3). After re-exporting, re-orienting, or
re-scaling the mesh you may need to adjust the `position` arrays so Main Gate /
Fortification / Summit / Ridge sit on the correct features of the mesh (edit
`data/sites.json`, no code change).