# Cal.com-inspired workspace design · 11 November 2026

The user's request was to improve Mimo using Cal.com, including checking whether its source is open. References inspected: https://cal.com, https://cal.com/rick, https://github.com/calcom/cal.diy and its MIT LICENSE. The former calcom/cal.com repository URL redirected to the community edition. No Cal source code, assets or dependencies were copied; licensing of proprietary hosted features was not inferred.

Implemented locally:

- Shared fine borders, neutral navigation, small shadows, compact typography, purple actions and consistent portrait shapes for learner and teacher workspaces.
- Available-date learner calendar with teacher context, date-specific times and explicit price/selection summary. Desktop has three columns at wide widths, two at intermediate widths, and stacked sections on phones. Month navigation is bounded to available months; date, month and format changes clear selection. Dates and times use Europe/Paris.
- Existing booking/review/reschedule storage rules and all onboarding/phone runtime behavior retained. No backend or Cal service connection.

Validation passed:

- `npm run build`: TypeScript, Vite, hosting preparation and 28 protected runtime hashes.
- `test:learner` (11), `test:teacher` (30), `test:onboarding` (24), `test:routing` (5): 70 unit tests.
- Playwright `usability-learner.spec.ts`, `device-routing.spec.ts`, `booking-calendar.spec.ts`: 9 tests. Coverage includes retained filters/sorts/review access, both booking presentations, reviews/profile portraits, competing checkout recovery, device routing, November/December calendar boundaries, disabled unavailable dates, keyboard activation and selection reset.
- In-app browser inspection: learner desktop search and three-column booking; iPhone/Pixel search (Pixel content width/scrollWidth both 427px); desktop teacher dashboard/calendar/module editor, editor Preview lesson dialog and fixed action footer; iPhone teacher library. Original companions, portraits and device chrome render.
- `git diff --check` passed.

Images here are dated local evidence, not visual regression baselines. `desktop-booking.png` and `phone-booking.png` use a fixed 29 November browser-test clock to exercise a month boundary; search/profile captures use the test's current clock. The phone booking capture can show the time list at its current scroll position; actions remain reachable by scrolling. Earlier captures under `qa/usability-feedback/` were preserved.

Limits: physical devices, exhaustive editor/review interactions, and hosted deployments were not tested. Browser-local storage is not shared scheduling infrastructure. No commit, push or deployment occurred.
