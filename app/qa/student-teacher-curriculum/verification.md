# Student-facing teacher curriculum verification

Verified locally on 11 November 2026. The Figma source and exact content boundaries are recorded in [sources.md](./sources.md).

## Implemented scope

Gilbert's learner-facing teacher profile now exposes the public lesson **A conversation at the café**, with French A2, six modules, nine blocks and 30 minutes of material. View lesson details opens a public page with Overview and Curriculum tabs, three learning outcomes and the six-module outline. Warm-up has a read-only Vocabulary recall · Practice preview. Each module is five minutes; block counts total nine.

The public outline is separate from private teacher drafts, submissions and booking state. It belongs only to Gilbert; the other 24 sample teachers do not receive cloned material. This page is available before booking and adds no enrollment, progress, course assignment or Continue learning behavior. Existing profile booking, messaging, reviews and live slot availability remain available. Booking opens the existing one-to-one time-selection flow with Gilbert's original 30-minute / €30 terms.

## Automated evidence

- `MOBILE_RUNTIME_TEST_PORT=4197 npx playwright test tests/public-teacher-lesson.spec.ts --workers=1 --reporter=line`: the desktop case passed; the two phone cases reached the final layout assertion but initially failed because a FlowStack Back transition briefly retained both outgoing and incoming content nodes. The test helper was updated to wait for one settled current content node before measuring. No product source changed for this correction.
- The targeted iPhone and Pixel retry (`--grep 'iphone|pixel-10'`, same fresh port and serial worker) passed **2/2** in 20.9 seconds. Together with the initial desktop pass, **all three distinct new browser cases are verified**. The first run was 1/3 in 23.9 seconds; this is not a claim of a later full three-case rerun.
- These cases enter via Search → Gilbert → View profile → View lesson details. They verify profile actions and available slots, the public summary, overview outcomes, accessible tab selection (desktop keyboard End), all six curriculum rows and nine rendered blocks, Warm-up collapse/keyboard reopen, details → booking → Back, profile reviews → Back, profile booking, and sending a teacher message. Both protected phone presets also verify a visible keyboard-aware message field, keyboard dismissal, retained four-item navigation and no horizontal content overflow. The desktop case additionally checks that Yuki has no public lesson card.
- `npm run test:learner`: **12/12 passed**, including the new public-catalog ownership/isolation and curriculum-total check. Existing filtering, Paris time, booking-lock/recovery, cancellation/rescheduling and public-review tests remain passing.
- `npm run build`: passed TypeScript, Vite production bundling and Sites packaging.
- `npm run check:runtime`: **all 28 protected files passed**, both at build preflight and in an explicit final check.
- `git diff --check`: passed.

The existing screenshot-writing learner usability spec was not rerun. Its original QA images were not overwritten; before/after SHA-256 values remain:

| Original capture | SHA-256 |
| --- | --- |
| `qa/usability-feedback/desktop-search.png` | `f54425180b6e6810cf4e34798f27bfa4d9909449308e6de8a6038d29eecd72ee` |
| `qa/usability-feedback/mobile-search.png` | `aa474f59ce41b03053a66f4de0a0e3cf76aafed46beafe8b6026ff65921e0fd7` |

## Review and limits

Read-only source review confirmed teacher/lesson ownership checks on the public route, safe fallbacks for invalid initial links, and reuse of existing booking/message navigation. Tabs have selected state, roving focus, associated panels and keyboard controls. The preview is descriptive material rather than an activity player.

Native in-app WebKit review confirmed Gilbert's profile card shows French A2, six modules, nine blocks and 30 minutes. View lesson details opened the complete Overview with all three outcomes and the existing €30 / 30-minute lesson terms. Keyboard ArrowRight selected Curriculum, revealing all six modules and the Warm-up Vocabulary recall · Practice preview. Captures: [teacher profile](./teacher-profile.png), [lesson overview](./lesson-overview.png) and [lesson curriculum](./lesson-curriculum.png). The curriculum capture is a **397×1034 narrow web viewport** after a browser resize, not a phone-preset capture.

Both locally served SVG illustrations loaded in their original color with computed `filter: none`. The miniature's rendered illustration bounds were 31.625×31.625px within a 31.6244px square SVG root; the overview illustration was 54.203×54.211px within a 54.2131×54.2132px root. These subpixel-rounded measurements support preserved square geometry. Asset metadata and the source record accompany the provided files. During review, the user changed the first review tab to Home; that state was left alone, and a fresh background tab was used for the miniature geometry read.

No product source changed after the tested build. Native phone appearance was not checked in this task. The automated phone cases above run the protected iPhone and Pixel preview presets in Playwright; they do not establish physical-device behavior. No broad unrelated browser suite was repeated. These checks cover local implementation, not connected messaging, payment, enrollment or cross-device services. No deployment is claimed by this verification record.
