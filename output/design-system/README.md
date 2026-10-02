# Mimo design system

Created 2 October 2026 from the current prototype.

[Open the Figma library cover](https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5?node-id=101-248)

Eight pages: getting started, foundations, pets/icons, buttons, choices, inputs, feedback, patterns. There are 135 component masters/variants in total, including 19 component sets; 13 new Nunito text styles; four effect styles; 108 new variables and 16 reused primitives. The semantic color collection has Learner and Teacher modes. Roles are also exposed as component variants; select the matching Role variant when switching a component's palette. Explicit component modes take precedence over a parent frame mode.

All four original pets are included (Luma/purple, Nori/blue, Mimo/green, Pip/yellow), plus the Luma lookout pose. Pet artwork remains raster inside editable components. Twelve icons are editable SVG vectors. Source flags and the Persona logo are included.

`tokens.json` stores exact exported Figma values, alias references and code syntax; `tokens.css` is a resolved handoff export and is not imported by the app. `source-map.json` maps implemented families to local React source. Hosted Code Connect could not be enabled: the connector reported that an Organization/Enterprise plan with a Dev/Full seat is required. This library is local to the existing Figma file, not published as a shared team library.

`state.json` holds returned construction IDs. `validation.json` contains per-page counts, properties and structural checks. The JavaScript files are construction records; live visual fixes were applied afterwards, so these are not a final resync script. Preserve the Figma file as the final design authority for this delivery.

All eight review sheets were visually inspected, including targeted rechecks after fixing asset sizing, narrow captions, example values and field fitting. Final structural audit found zero overflowing review text, zero unstyled component text, and zero unbound solid fills on component roots. All new variables have code syntax and explicit scopes; role colors are aliases. Existing source primitives gained code syntax metadata. Runtime integrity passed for all 28 protected files. No app behavior changed.

The original bright primary colors remain for fidelity. Added accessible primary alternatives are proposed: white on #773BC2 = 6.59:1; white on #08658F = 6.43:1. Existing white on #9955E8 = 4.36:1 and white on #1CB0F6 = 2.44:1. The library does not claim complete accessibility compliance. Disabled states are intentionally subdued. Dark mode, animation playback, and production backend behavior are not implemented.

Extended palettes, status badges, disabled/outlined-error field states, empty cards and dialogs are labeled as design additions. Home navigation reuses the existing proposed home components. Interaction states are static specimens; runtime behavior is documented on the cover.
