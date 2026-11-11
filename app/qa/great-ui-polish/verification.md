# Great UI polish — 11 November 2026

Implemented the user's requested Great UI skill, retaining the monochrome app design and protected runtime.

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| Medium | Shared action buttons | Pointer presses had little feedback | `.96` scale / 150ms ease-out; static, keyboard and reduced-motion escape paths | Clear feedback without slowing repeated keyboard actions |
| Medium | Teacher fields/editor and portal UI | Competing focus rings and unguarded hover/entrance rules | Solid 2px keyboard outlines, fine-pointer hover, immediate account menus/tooltips | Visible keyboard focus and predictable touch behavior |
| Low | Learner filters | Conditional check icon moved filter widths | Reserved icon slot; exact contextual fade/scale/blur recipe | Stable controls when selected |
| Low | Lesson cards, forms and summaries | Competing gaps and uneven action placement | Single spacing owners, aligned action areas and balanced content rhythm | Clearer grouping |
| Low | Nested controls and profile media | Inconsistent corner offsets/outlines | Concentric inset corners and pure-black 10% image outlines | More coherent surfaces |

Verification:

- 79 unit/worker tests, 17 browser tests, production build and all 28 runtime hashes passed.
- Final focus-only override was source-checked and included in the final production build.
- Actual in-app browser pointer hold: active shared learner button scale `0.96`, 150ms ease-out. Keyboard Space hold: active button scale `1`, solid `rgb(23,23,23)` 2px outline, transition `none`. Both actions completed normally on release.
- Filter widths measured 81px / 97px before and after selection; static selected state and visible checkmark remain.
- Source inspected for disabled/selected, focus, pointer-only hover, portal behavior and reduced-motion rules. Fresh desktop/iPhone search captures are in this folder; previous QA originals were restored byte-for-byte.
- No protected runtime edits, production integrations, commit, push or deployment.

Not verified: physical touch hardware, Safari compositing, full 10% slow-motion/frame-by-frame playback, an actual OS theme switch (no theme switcher exists), and every possible screen/state combination. Existing phone gesture/keyboard browser tests pass; reduced-motion rules were source-checked rather than toggling the user's OS preference.

Approve for the inspected scope; no actionable findings remain there.
