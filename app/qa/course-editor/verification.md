# Course editor verification · 5 November 2026

Implemented on the personal fork's `feat/teacher-course-editor` branch. The original repository, its main branch, Vercel project and live domain were not changed. This is a frontend prototype; Apply changes updates a browser-local applied snapshot.

## Automated checks

- Clean `npm ci` after filling two missing optional dependencies in the existing lockfile.
- Production TypeScript/Vite build and static-worker packaging.
- All 28 protected mobile-runtime hashes unchanged and passing.
- 15 teacher/model tests: existing workspace and calendar regressions plus seven new course-editor tests covering valid A1/C1 templates, independent copies, answer normalization and all seven assessed formats, required keys, immutable nested reorder/cross-module moves, incomplete lessons, legacy conversion, private-note exclusion, independent learner snapshots/adaptations, and explicit draft persistence/storage failures.
- 16 onboarding tests, five device-entry routing tests, and four static-worker tests.
- `git diff --check`.

## Rendered interaction checks

Used the actual shared teacher workspace in the in-app browser with the local Vite server. Desktop was 1280 × 720. Phone checks used the existing iPhone and Pixel 10 device runtime, not a replacement mobile page.

- Desktop editor, source typography/raised controls, elements library, central canvas and properties rendered together. Total lesson duration appears alongside language and level, with the breakdown in Lesson properties.
- iPhone editing areas switch between Elements / Canvas / Properties; editable lesson title, module minutes and Undo/Redo worked. iPhone editor client/scroll width both 357 px; Pixel both 391 px. Original device chrome and keyboard fields remain mounted. Physical phones were not used.
- Preview shows one block, module context, progress and previous/next controls. Phone preview opens an app screen. Correct/incorrect vocabulary responses, accent/case/space normalization, locked submitted controls, gated reveal, canonical answer display, retry and next-card/module navigation worked.
- Teacher changed a quiz's correct option to “A book”; selecting it then submitting/revealing produced ✓ Correct with that answer. Matching pairs displayed correct per-pair results. Sentence tiles constructed “Je voudrais un café” and produced ✓ Correct. Written and simulated spoken submissions displayed teacher-review confirmation without an automatic grade.
- Native pointer drag reordered Vocabulary before Warm-up. Another drag moved the full recall block from Warm-up into Vocabulary. Undo restored both changes. More actions also moved a module earlier. Pure-model tests cover other move boundaries. Long-distance drag auto-scroll was not tested.
- Canvas Add block opened the chooser; choosing Practise → Quiz added an editable block. Module creation opened its property controls. Incomplete custom modules could not be applied, with specific title/goal/block/recipient messages.
- Save changes survived a browser reload. Applying with Léa selected and Save as a template checked stored an applied snapshot and an own template. Ready-made A1/C1 and the saved own template appeared. Using C1 created a new editable lesson with advanced vocabulary, clauses and an article.
- Uploaded the existing Nori PNG as a test image. Local blob preview rendered; after explicit save and reload, the image loaded again from IndexedDB.
- Desktop browser error/warning log inspection was empty at the end of the checked flows.

## Scope and limits

Saved drafts, applied snapshots, templates and files stay in this browser/device; clearing browser storage removes them. Unrelated workspace flows remain in-memory simulations. A saved working draft does not mutate its applied snapshot. No backend, student notification, teacher inbox, real microphone capture, account persistence, cross-device synchronization or deployment was added. Recorded-response controls clearly simulate capture; generated pronunciation/sample audio depends on available browser speech synthesis. Actual uploaded media uses browser playback; not every audio/video/document codec was exercised. Attached documents open as files; document parsing/conversion is not implemented. Practice attempts are preview-session interactions and reset when their block is remounted. Automated browser runtime suites, screen-reader use and physical touch hardware were not re-run in this change.

Screenshots: `desktop-editor.jpg`, `student-preview.jpg`, `iphone-editor.jpg`, `iphone-preview.jpg`.


## Hosted teammate review — 5 November 2026

At the user’s subsequent request, published an independent public Sites review copy at https://mimo-teacher-review.sillyatlas2.chatgpt.site . User explicitly chose Anyone with the link. Version 1 deployment succeeded; fresh retained-checkout build, 28 protected hashes and four worker tests passed. Hosted browser checks opened Lessons, the café editor, and a student preview with one block and module context. `hosted-review.jpg` records the published editor. The original repository/live Vercel site and fork main remain unchanged; visitors’ drafts are local to each browser. This supersedes the earlier no-deployment scope for this separate review copy only.


## Direct review links — 5 November 2026

Added safe `flow`/`lesson` initial routing in the shared workspace. `?teacher=1&view=web&flow=editor&lesson=cafe` and its mobile variant open the example editor directly. `flow=lessons` opens the library, `flow=preview&lesson=cafe` opens the student preview. Unknown lesson IDs fall back to the library and unsupported action-like flows cannot trigger save/apply/share. Normal onboarding and default teacher entry are unchanged.

Sites version 2 deployment succeeded. Verified hosted desktop editor entry and refresh, plus phone editor entry, with no onboarding/menu interactions. Automated verification: 17 teacher tests (including two new entry tests), 16 onboarding, five routing, four worker tests, build and 28 protected runtime hashes passed. Screenshot: `direct-editor-link.jpg`.


## Expanded workspace layout — 5 November 2026

Applied the five requested placement/space changes, preserving existing functionality. Web fills the app-owned white frame with independently scrolling panels and pinned bottom-right actions. At 1280×720 the editor is 1016×644 below the toolbar; footer y=640 remains unchanged while the canvas scrolls. Undo/Redo sits beside Elements; no editor Lessons button remains; a single status badge is beside Teacher view. Existing lesson metadata retains language/level/time.

Checked desktop Preview, Save changes and Apply dialog/cancel, mobile Undo, keyboard-aware footer placement and footer removal/restoration when navigating to/from student preview. Shared public desktop and phone entry render the updated layout. Production build, all 28 protected runtime hashes, 17 teacher tests, 16 onboarding tests, five routing tests and four worker tests passed. Sites version 3 deployment succeeded. Screenshots: `layout-expanded-web.jpg`, `layout-expanded-mobile.jpg`. No audit-recommended data-loss/media fixes were included in this layout-only change; those remain outstanding.


## Module editor title and back controls — 5 November 2026

Renamed breadcrumb, phone header and canvas label to Module editor. The header back icon is available on direct entry, and a bottom-left Back button shares the footer row with Preview lesson / Save changes / Apply changes. Verified both desktop controls return to the lesson library. Verified phone footer alignment (all four button tops identical, footer client/scroll width 393px), Back navigation and disappearance of the editor-only action portal on the library screen. Original non-editor back behavior remains unchanged. Build, 28 protected runtime hashes, 17 teacher tests, five routing tests and four worker tests passed. Sites version 4 succeeded; hosted desktop labels/controls checked. Screenshot: `module-editor-back-controls.jpg`.
