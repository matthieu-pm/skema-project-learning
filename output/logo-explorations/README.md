# Mimo logo explorations

Created 6 October 2026 in the existing Mimo Figma file.

## Current direction: original purple pet

Latest typography revision: all 12 wordmarks now use **Labil Grotesk**, with Bold for layouts 01–03 and Medium for layout 04. The connected Figma font catalog does not expose this installed local font, so the exact glyph outlines were generated from the user's installed OTF files using HarfBuzz shaping and FontTools, with -2.5% tracking. Wordmarks are now editable vector outlines, not live text; original Luma artwork remains unchanged. Visual inspection and containment checks passed for all 12. `labil-outlines.json`, `update-labil-wordmarks.js`, and `labil-state.json` record the outline geometry, update, and replacement node IDs. Font files are not copied into this project. Earlier editable-text descriptions below refer to the prior revision.

The user requested the original purple pet in the logo. [Open the revised Luma board](https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5?node-id=151-248), on the same logo-explorations page. Four layouts use the existing purple Luma artwork: Side by side, Luma above, Companion badge, and A little hello (peeking crop). Each includes light- and dark-background previews. The pet is the original raster image, reused from library component `93:252` / image layer `93:253`; wordmarks and layouts remain editable. These are not all-vector logos.

Visually inspected the 1472 × 1417 board. Structural verification found 12 lockups, 12 original Luma images, and no text overflow. Primary lockups have 3× PNG export settings. `luma-state.json` records IDs; `create-luma-logos.js` records the creation script, which should not be rerun for updates. The earlier abstract concepts remain as exploration history.

## Earlier abstract concepts

[Open the six-direction review board](https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5?node-id=149-249), page `08 · Logo explorations` (`149:248`).

1. Say hello: speech-bubble m.
2. One to one: two people form an m, in purple and blue.
3. Little companion: pet-inspired silhouette with eyes.
4. Open dialogue: flowing m with a speech-tail finish.
5. Shared chapter: paired book pages, with an exploratory green palette.
6. Back and forth: paired speech bubbles.

Each direction has a primary color lockup, one-color lockup, reverse lockup, app-icon preview, and 24 px symbol. Symbols are editable vectors; wordmarks are editable Nunito or Fredoka text. Primary lockups and app-icon frames have SVG export settings.

These are exploratory concepts, not a selected identity or app implementation. No existing Figma designs were modified.

Verification: inspected the rendered 1840 × 1403 review board. Structural check found 18 logo lockups, 75 vector nodes, and no text overflow. Small-size studies were visually inspected on the board; no product integration or recognition study was performed.

`state.json` records node IDs. `create-logos.js` records the construction script for provenance; rerunning it creates a new page and should not be used for updates to the delivered page.
