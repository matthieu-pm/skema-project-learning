# Teacher workspace verification — 10 October 2026

The new frontend follows the supplied Students / Schedule / Lessons / Profile architecture and the live FigJam teacher flows at `440:2676` and `466:3308`. It shares screens and state rules across desktop web and the iPhone/Pixel mobile preview. All data/actions are local simulations; no external messages, bookings, payment, camera, or provider calls occur.

## Rendered interaction checks

- Actual teacher onboarding through sample Google account, French/A2, Online, 45 minutes, €42, and deferred identity: completion opens the workspace; Alex's public profile details transfer correctly.
- Adapt a reusable café lesson from Léa's profile; change the title and private notes; request optional sample AI material, review and apply an editable block, preview, approve, and explicitly share with Léa. Private-note sentinel is absent from learner preview. Source lesson remains reusable.
- Set AI unavailable: editor presents the manual fallback. Set offline: message send fails, editable draft stays; reconnect and retry sends locally and clears the draft.
- Reschedule Léa's 14:00 booking to 16:00: conflict rejected. Propose 15:00: original stays at 14:00 with a pending replacement; sample learner acceptance changes the booking to 15:00.
- Select the adapted approved lesson, inspect lobby, join sample session, advance activity, write private session notes/human feedback, and end session. Completed session keeps a lesson snapshot. Review/share recap and optional next practice; private-note sentinel is absent from learner preview.
- Review Maya's sample written response, edit human feedback, preview and share. Share confirmation updates locally.
- Lucas no-show: message path and descriptive issue review/submission produce an issue record without deciding fault or compensation.
- Noah meeting request: next-week navigation, confirmation, cancellation review and explicit cancellation update local booking status.
- Availability save preserves existing bookings. Unsupported timezone edits are blocked rather than silently reinterpreted.
- Mobile lesson editing shows the keyboard; switching Profile hides it and resets navigation to one current screen without a stale Back button. Edits stay in workspace memory.
- Sample Persona identity completion and payout status transitions display truthful preview states. No real identity/payment data is requested.

## Layout and regression checks

- Desktop workspace inspected at the native browser panel and 1280px; responsive web inspected at 390 × 844, with document `scrollWidth === 390`.
- iPhone and Pixel 10 mobile schedule inspected. Current content widths match scroll widths (393px / 427px); no broken images. Fixed tab navigation and safe-area fill remain above the home/navigation bars. The lesson editor and mobile keyboard were checked separately.
- Fresh responsive-web console check: no warnings/errors. A transient development HMR circular import was resolved by extracting workspace context and shared controls; final production build succeeds.
- `npm run test:onboarding`: 16 passed.
- `npm run test:teacher`: 6 passed, covering confirmed-slot conflicts, adaptation/source preservation, private immutable learner snapshots, required lesson blocks/durations, public profile transfer, and architecture parent tabs.
- `npm run build`: TypeScript, Vite, static-worker output, and 28 protected runtime hashes passed. Protected runtime sources/lock unchanged.
- `git diff --check`: passed.

## Limits

State resets on reload and is not synchronized between web/mobile tabs. The fixed sample calendar is October 2026. Availability supports Europe/Paris only. This is a frontend mobile simulation, not an installed native application. Real learner services, video, AI generation, calendars, message delivery, payouts, and identity verification remain unconnected. No deployment or full protected-runtime Playwright suite was performed for this app-owned change.

## Uxcel redesign and full calendar revision

The earlier captures/checks above describe the initial workspace. The latest teacher surfaces use the user-selected Uxcel Home flow (Mobbin `67d21fa1-0aba-4f35-9615-35dd8102342d`), actual generated shadcn sidebar-08 primitives and Hugeicons. Onboarding, landing and protected runtime remain separate.

Fresh checks in the redesigned UI:
- Desktop Day/Week/Month switching, next/previous month, date-cell drill-down to Day, and booking click through to session details with prepared lesson/reschedule/cancel controls.
- Next-week Requests filter retains Noah and removes Maya; all sessions can be restored. Empty periods retain the full date grid and zero session count.
- iPhone Month/Week/Day switching, next-day navigation, Today return, and month calendar layout; Pixel Month layout. Current screen widths equal scroll widths (393px / 427px).
- Responsive web at 390px: month grid fits without horizontal overflow; navigation drawer opens with readable section/submenu links and closes after selecting Schedule. Fresh console has no warnings/errors.
- Desktop sidebar icon collapse, expanded Lessons/Library link, account menu → Account settings, and student search → one Maya card.
- Calendar tests cover Monday week boundaries, leap days, 35/42-cell month grids, month-end clamping, year rollover, and independent overlapping/adjacent event columns.

New proof images: `calendar-month-web.jpg`, `calendar-month-iphone.jpg`, `calendar-month-web-390.jpg`. Calendar actions are local simulations. Build, 28 protected hashes, 16 onboarding tests and 8 teacher tests passed; no deployment or native binary was produced.

## Buttons/cards merged with onboarding

Latest surface revision is scoped to teacher UI in `onboarding-blend.css`: 12px raised buttons, 16px outlined cards, pastel illustration areas and unchanged compact layout. Desktop dashboard, session controls and Month calendar visually inspected. Primary/button activation still navigates to session details; focus/release geometry shows no stuck transform. Focused secondary action retains its lower-edge shadow and 3px outline. iPhone dashboard and lesson cards inspected; Pixel lesson screen retains 427px client/scroll width, iPhone retains 393px. Browser console has no warnings/errors.

Rendered primary/button radius and lower edge are 12px/4px; card radius/border/lower edge are 16px/2px/2px. Active, disabled and reduced-motion overrides were reviewed in source. Narrow-web resizing did not apply to the background verification tab, so no new 390px result is claimed for this surface revision. Physical-device gestures and 10% animation playback were not verified. Existing calendar geometry/flows and onboarding sources are unchanged.

Captures: `onboarding-blend-web.jpg`, `onboarding-blend-iphone.jpg`. Build, existing test suites and all 28 protected runtime hashes passed.
