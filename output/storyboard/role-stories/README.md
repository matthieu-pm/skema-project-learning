# Six reasons to use Mimo

Created and verified on 2 October 2026.

[Open the FigJam collection](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=250-1964)

Six role-specific storyboards, each with four editable illustrated scenes:

| ID | Role | Story | FigJam section |
| --- | --- | --- | --- |
| S1 | Student | Past the basics | [251:1964](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=251-1964) |
| S2 | Student | When real speech is too fast | [251:1993](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=251-1993) |
| S3 | Student | A lesson that fits this week | [251:2022](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=251-2022) |
| T1 | Teacher | Adapt without starting over | [251:2051](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=251-2051) |
| T2 | Teacher | A no-show needs a clear next step | [251:2080](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=251-2080) |
| T3 | Teacher | Helpful AI, with a human check | [251:2109](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=251-2109) |

## Files

- `stories.json`: scene copy, issue, emotional state, research source, validation question, and prototype boundaries.
- `figma-state.json`: collection, storyboard, and card IDs.
- `drawing-primitives.mjs`, `draw-role-scenes.mjs`: editable vector illustration source. Run `node output/storyboard/role-stories/draw-role-scenes.mjs` from the project root to regenerate the contact sheet.
- `role-scenes.svg`: 24 distinct named scene groups, imported into FigJam as editable native vectors and placed into their cards.
- `S1.png` through `T3.png`: final individual storyboard screenshots.
- `overview.png`: final collection screenshot.

## Verification and scope

All six individual screenshots and the collection overview were visually inspected. Scene illustrations, headings, captions, source notes, and boundaries are legible and fit their cards. Structural validation reported zero section-child bounds violations and zero sibling-text overlaps. The existing storyboard was preserved; no app files were modified for this task.

The narratives are research-informed illustrative scenarios, not interview quotations. The board labels current setup, proposed experiences, and intended outcomes separately. Booking, live teaching, lesson resources, no-show handling, and AI drafts remain proposals beyond the implemented onboarding. Intended outcomes require testing. No cancellation fees, refund rules, wait times, forced matching, group teaching, or practice quotas were introduced.
