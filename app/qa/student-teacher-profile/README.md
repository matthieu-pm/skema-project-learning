# Student teacher profile — 11 November 2026

Implemented locally on `dev/student-teacher-curriculum`. No merge or deployment.

## Source

The user supplied [Mimo Students, page 9:2](https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=9-2). Read the design context and screenshots for:

- [Teacher profile, 14:545](https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=14-545): Gilbert, profile facts and the café lesson summary.
- [Lesson overview, 14:621](https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=14-621): French A2, title, description, three goals and one-to-one session details.
- [Curriculum, 97:2345](https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=97-2345): six modules, nine blocks, 30 minutes; five minutes per module. Block formats follow the existing café example in `src/teacher/course.ts`.
- [Booked session details, 14:1338](https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=14-1338) was inspected as related reference; no booking storage or session-management behavior changed.

Adapted to the current Cal.com-inspired workspace, Labil Grotesk, Hugeicons, generated fictional portraits and protected phone runtime. The original Figma screenshots were not used as app assets.

## Implemented

Gilbert’s student-facing profile now exposes lesson details and a direct curriculum action. The lesson screen provides Overview / Curriculum tabs, goals, language/level, format, duration, price and expandable module block lists with Teach/Practice labels. Tabs support arrows, Home and End. Module disclosures are native keyboard controls; their state survives tab switching. Booking and contact actions open the existing teacher-specific flows.

Only Gilbert has an authored public lesson in this supplied reference. Other sample teachers show an explicit empty state and contact action. The public catalogue contains no private notes, answer keys or browser-local teacher drafts. No enrollment, progress, paid course entitlement, block player or teacher/student synchronization was added.

Direct preview: `/?learner=1&view=web&flow=teacher&teacherId=gilbert`; use `view=mobile` for the phone runtime, or `flow=curriculum&section=curriculum` for the outline. Invalid or absent teacher/outline inputs recover without a crash.

## Verification

- `npm run check:runtime`: all 28 protected hashes unchanged.
- Full unit/worker suite: 83 passed.
- `npm run test:production -- --workers=2`: build and 25 browser checks passed, including all three new profile tests.
- New browser checks cover search → profile → overview/curriculum, nine blocks, disclosure state, keyboard tabs, layout overflow, fixed phone navigation, booking/contact routing, direct entry and unpublished outlines.
- Manual desktop, iPhone and Pixel review; production-built desktop curriculum also inspected.
- Existing historical screenshots rewritten by regression tests were restored. Prior release documentation/captures were preserved.

Evidence: `desktop-curriculum.jpg`, `iphone-overview.jpg`, `iphone-curriculum.jpg`, `pixel-curriculum.jpg`. These show local fictional sample content.

Practice wording follow-up (11 November): updated all app-owned spelling, including the block-purpose discriminator and sample copy. Legacy library records normalize on read without rewriting authored text or stored snapshots. Build and 28 runtime hashes passed; 35 teacher tests (including legacy saved drafts) and 7 editor/profile browser checks passed. Current built-screen evidence: `practice-spelling.jpg`. Historical captures are preserved.
