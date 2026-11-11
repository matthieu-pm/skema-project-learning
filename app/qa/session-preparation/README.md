# Booked-session student preparation — 11 November 2026

Implemented locally on `dev/student-session-preparation`. No merge/deployment for this follow-up.

## Source and scope

The user identified the missing preparation modules for booked sessions. This extends the previous public lesson preview into session-specific work.

Read the Students Figma design context and screenshots for [course overview 14:1844](https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=14-1844), [student player 97:978](https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=97-978), and [course sessions 97:2597](https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=97-2597). Earlier inspected curriculum `97:2345` and booked-session details `14:1338` provide the module outline and preparation entry. Keep the current Cal.com-inspired surfaces, Labil Grotesk, Hugeicons, existing Lessons tab and protected phone runtime.

The explicit sample assignment is `cafe-a2-v1`, built from the existing authored café template with the source A2 level, stable activity IDs and an ordering dialogue suitable for the listening response. It does not consume private notes or live teacher drafts. New Gilbert bookings attach this version; legacy Gilbert bookings use this explicit sample fallback. The fresh Upcoming fixture now uses Gilbert; saved booking teachers/terms are untouched. Other teachers show an unassigned state and contact action.

## Implemented behavior

- Booking success, Home/Upcoming lesson cards and session details open preparation.
- Six modules contain nine real interactive blocks. Recall requires both cards; teaching cards require exploring both meanings and acknowledgment; matching/sentence exercises require submission before answer reveal; listening has generated sample speech and an accessible transcript; written and spoken-rehearsal transcripts save as open responses; recap uses acknowledgment.
- A submitted/reviewed attempt counts even if incorrect. Completion does not imply proficiency or a teacher grade. Navigation never completes an activity. Joining a session remains available with unfinished preparation.
- The progress store is separate from bookings, keyed by booked session plus immutable assignment version. Answers/drafts and completion resume after reload and rescheduling. Web Locks serialize read/merge/write operations; different blocks/sessions retain independent work. Same-block edits in different tabs use the latest saved attempt.
- Save/read failures preserve existing stored data and keep current inputs for retry; no completion is claimed before a successful save. Cancelled sessions cannot submit preparation. Existing confirmed scheduling/payment behavior is unchanged.
- Phone player has a bounded MobileScroll body and persistent context/Previous/Next controls, preserves the four-tab footer, and reveals focused fields above the simulated keyboard. Speech stops on block/route changes.

This is browser-local prototype progress. No connected teacher assignment delivery, real microphone recording, backend review, server authorization or cross-device synchronization was added. Spoken practice uses an aloud rehearsal and typed transcript. Answer-key checks are client-side prototype behavior.

## Verification

- Production build and all 28 protected runtime hashes passed.
- 90 unit/worker tests passed, including six new preparation tests.
- All 31 production-browser checks passed, including six new preparation checks: desktop and phone full nine-block completion/reload; new-booking entry/draft saving/write failure; unassigned/cancelled/missing session recovery; iPhone and Pixel keyboard clearance/fixed controls.
- Manual desktop and iPhone checks covered booking entry, saved recall, progress in another presentation in the same browser, written response saving and visible keyboard/submit controls. Desktop browser warning/error logs were empty. Pixel was verified through browser automation, not a physical device.
- Historical screenshots rewritten by regression tests were restored. Earlier release documentation and captures were preserved.

Preview: `/?learner=1&view=web&flow=preparation&bookingId=sample-upcoming`; use `view=mobile` for the phone.

Evidence: `desktop-curriculum.jpg`, `desktop-answer.jpg`, `desktop-progress.jpg`, `iphone-curriculum.jpg`, `iphone-keyboard.jpg`, `iphone-response.jpg`.

## Production release

The user subsequently authorized merge/deployment. [PR #7](https://github.com/matthieu-pm/skema-project-learning/pull/7) merged as `4fbfd7bed4c3ce81f461337f5445324e3b0e3926`; its tree equals tested `e8f81d2`. Fresh checks passed 90 unit/worker tests and 31 production-browser checks, the build and 28 protected runtime hashes. Vercel Git deployment `dpl_dwg8SCgRc2NeVnYQZQNkTUSaCGbw` reached Ready on [the production domain](https://skema-project-learning.vercel.app).

Hosted desktop smoke checks followed Upcoming → preparation → player and completed both recall cards. Progress stayed 0/9 after the first card, then saved 1/9 after the second submission/reveal. A fresh iPhone view in the same browser resumed 1/9, retained all four navigation tabs, and measured 393px client/scroll widths. Both browser warning/error logs were empty. The hosted smoke check exercised one module; the full nine-block path was covered by the production-build browser suite. Captures: `production-desktop.jpg`, `production-iphone.jpg`. No cross-device synchronization or teacher delivery is implied. Local main is synchronized; these release notes/captures remain local follow-up evidence.
