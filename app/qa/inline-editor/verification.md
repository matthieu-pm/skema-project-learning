# Direct canvas editing and dashboard annotations — 11 November 2026

User-requested changes:

- Students library summary is a complete card with neutral border, 8px corners, 20px inset and a contained library button.
- Entire right dashboard aside stays sticky in desktop two-column layouts; bounded height and internal scrolling retain access to every action in short windows. Phones and one-column web retain normal flow.
- Removed the two helper paragraphs beginning “Choose a learning focus” and “Drag the grip to reorder”. Empty outline text is centered within its own padded region.
- Lesson/module metadata and full block content are directly editable on the canvas. There is no Edit button, disclosure or separate edit mode. The sidebar remains synchronized, and outline selections reveal the relevant canvas group.

Verification:

- 79 unit/worker tests, 21 browser tests, production build and all 28 protected runtime hashes pass. Whitespace checks pass.
- New `tests/course-editor-inline.spec.ts` adds four regressions: immediately editable fields with no Edit/Done controls; correct module/block targets with sidebar, outline, content and total synchronization; Undo/Redo and explicit device-local Save/reload behavior; phone keyboard visibility and panel parity; new lesson and centered empty-outline recovery.
- Existing 17 browser tests remain green. Earlier QA screenshots were restored byte-for-byte. Fresh captures are in this directory.
- Temporary short-window browser check at 1000×520 scrolled the aside internally and activated its final View schedule action. Phone aside remained static and without overflow. The temporary test was removed after verification.
- Actual in-app browser: card computed 1px full border, 20px padding and 8px corners; no horizontal overflow. Main pane scrolled 152px while the aside stayed visible/pinned. Canvas minute input was editable immediately: 5→8 updated its sidebar counterpart and total 30→33; Undo restored 5/30 while preserving the shared draft.
- Direct-input keyboard components, protected mobile runtime, existing sharing/validation/private-data boundaries and applied snapshots remain unchanged. No backend service, publication, commit or push was added.

Limits: physical devices, exhaustive combinations of every media/block type, and production services were not verified. All data and delivery remain prototype-local under the existing boundaries.
