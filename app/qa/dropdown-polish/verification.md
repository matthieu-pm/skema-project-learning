# Dropdown and editor label verification — 11 November 2026

Implemented locally:

- Shared desktop Radix Select menus across teacher fields, calendar filters and learner filters/sorting. White surfaces, restrained shadow, 8px menu corners with 4px padding/option corners, 36px rows, highlighted choices and selected checkmarks. High-frequency menus open without movement or staged animation.
- Native controls remain inside phone presets and in forced-colors mode. Empty-valued choices such as Not set and Choose a match remain selectable.
- Publish course labels the editor footer and corresponding confirmation. The existing explicit local apply/snapshot flow, recipient/template choices and profile-readiness validation remain intact.
- Removed the Teacher view canvas text and exact Student preview · responses and sharing are simulated footer.
- Passed disabled explicitly for submitted answers and recording-busy module/block navigation. Desktop Dialog and Select share installed focus/layer module instances; root version pins eliminate duplicated contexts while the protected phone BottomSheet retains its original dependency versions.

Verification:

- 75 unit tests and 4 Sites worker tests passed.
- Production build/TypeScript and all 28 protected runtime hashes passed.
- All 28 distinct browser cases passed. The main parallel run passed 27/28, with one timing failure in the unchanged keyboard-footer drag test. It passed immediately in isolation; all 8 protected runtime browser cases then passed serially. No deterministic regression reproduced; protected runtime source was untouched.
- Seven new browser cases cover desktop typeahead, keyboard and pointer selection, checked state, Escape/focus return, Publish and Preview nested menus, optional Not set values, submitted-answer locking, native phone selection, and forced colors. Existing learner tests select through visible controls for each presentation.
- Actual in-app browser checks at 1796×1034 confirmed canvas/sidebar synchronization, typeahead/Enter and Undo, selected/highlighted menu styling, nested dialog focus, ArrowDown and Escape closing only the menu with focus restored to its field. Preview has no annotated simulation footer and the editor has no Teacher view text.
- Original dirty usability QA screenshots were restored byte-for-byte after tests. Current automated captures are in ../select-control/.

Evidence: editor-dropdown.png and preview-dropdown.png.

Not verified: physical phone hardware, assistive technology sessions or deployment. This remains the local prototype; no Git publication or deployment occurred.
