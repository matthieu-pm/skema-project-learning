# Landing polish review · 6 October 2026

## Clear actions and honest scope

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM, fixed | app/public/landing/index.html:43 | Vague exploration actions and implied lesson availability | Direct preview/example labels, concise goal-led copy, explicit planned features | UX writing: users can predict destinations and understand what works today. |

## Geometry and surfaces

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM, fixed | app/public/landing/landing.css:19 | Tall controls with tight corners | 36px actions, 32px navigation action, 14px corners | User-directed density and roundness; visible controls fit the page. |
| MEDIUM, fixed | app/public/landing/landing.css:32 | Detached floating bar | Top-attached island with joined mobile menu | Requested spatial relationship; no gap above navigation. |
| LOW, fixed | app/public/landing/landing.css:106 | Inconsistent nested feature corners and flat depth | Concentric feature panel/image radii, layered neutral shadows, black image outlines | Surface consistency and clear elevation. |

## Contextual feedback

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM, fixed | app/public/landing/landing.css:356; app/public/landing/landing.js:1 | Abrupt icon swap and weak selection cue | Interruptible menu icon transition, stable selection check, concise status announcement | Icon transitions and static feedback keep changed states understandable. |
| LOW, fixed | app/public/landing/landing.css:21 | Inconsistent press feedback | Scale .96, exact transitions, reduced-motion override | Tactile response with motion restraint. |

## Typography

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW, fixed | app/public/landing/landing.css:1 | Nunito | Local Labil Grotesk variable with adjusted heading weight and tracking | Explicit user direction; fits the Clay-inspired composition. |

## Verification

- Rendered at 1280px and 390px; no horizontal overflow. Desktop navigation top 0px. Mobile navigation/menu edges meet at 64px.
- Checked Travel, Work, Everyday life, phrase shortcut, selected check, status text, focus transfer, menu open/close, Escape focus return, menu-anchor closure, FAQ expansion, and entry to the existing welcome.
- Production build and all 28 protected runtime hashes pass. No mobile runtime files changed.
- Source-reviewed hover, press .96, timing, reduced-motion styles, and focus indicators. Loading and empty states do not apply to these static controls.
- Not verified: animation replay at 10% speed, held-pointer active visuals, comprehensive keyboard/screen-reader audit, reduced-motion OS emulation, or user comprehension testing. These are not included in the approval scope.

Approve
