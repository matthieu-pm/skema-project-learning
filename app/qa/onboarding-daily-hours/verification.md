# Compact onboarding and daily working hours verification

Local verification on 11 November 2026 in the `2432/skema-project-learning` worktree.

## Implemented scope

- Web onboarding now uses a compact Cal.com-inspired wizard card, segmented progress and actions immediately below the current form. Before role selection, it shows Choose your path and two entry segments; selected roles retain their actual branch counts. Teacher setup remains eight steps, with a separate optional identity count. Phone FlowStack navigation and keyboard-aware controls remain intact.
- Availability now supports one independent working interval for each weekday. Switching a day off retains its hours, and only enabled days are validated. Invalid enabled-day ranges produce weekday-specific errors. Europe/Paris-only saving, offline retry, saved/unsaved feedback, in-memory drafts, no teaching-price gate and unchanged confirmed bookings remain.
- The pending shared sidebar revision starts with the account menu, omits the app wordmark and retains desktop collapse, keyboard menus, support links and narrow-web drawer focus restoration.
- The final desktop density refinement visually hides repeated time-field labels while retaining full accessible names. Narrow web and true-phone layouts retain visible labels. Desktop rows use a uniform 57px minimum height.

Availability remains workspace memory state. These changes do not add persistent accounts, cross-device availability, learner/calendar synchronization, multiple intervals per day, date exceptions or new supported time zones.

## Full verification before the final density CSS refinement

All **82 unit/worker tests passed**:

| Suite | Passed |
| --- | ---: |
| Onboarding | 24 |
| Teacher workspace and course editor | 33 |
| Learner | 11 |
| Device routing | 5 |
| Locations | 5 |
| Sites worker | 4 |
| Total | 82 |

Each suite ran through its existing `npm run test:*` script. Production build/typecheck, Sites packaging, all 28 protected runtime hashes and `git diff --check` also passed.

The fresh-process browser command was:

```sh
MOBILE_RUNTIME_TEST_PORT=4190 npx playwright test --workers=1 --reporter=line
```

**All 49 cases passed on the first run in 1.5 minutes**, without retries:

| Browser coverage | Passed |
| --- | ---: |
| Availability | 10 |
| Button interactions | 4 |
| Direct course editing | 4 |
| Device routing | 3 |
| Protected mobile runtime | 8 |
| Shared selects | 7 |
| Teacher review | 2 |
| Learner usability | 4 |
| Onboarding usability | 4 |
| Shared workspace sidebar | 3 |
| Total | 49 |

The changed Availability cases cover independent Monday/Tuesday edits, saving and dirty-state feedback, navigation retention, off/on retention, empty schedules, missing/equal/reversed enabled-day times, disabled invalid ranges being ignored, weekday-specific recovery, unsupported zones, offline reconnect/retry, missing profile terms, confirmed-booking preservation, narrow web, and iPhone/Pixel native selection, keyboard reveal and reachable saving.

The onboarding cases cover compact in-form action placement on desktop and 390px web, email/change-email/wrong-code recovery, guardian email validation and explicit handoff, Persona-to-document fallback, invalid birth-date recovery, document/selfie completion, web/phone learner completion, teacher review edit/save return, unset versus confirmed-free terms, and accurate setup/optional-identity progress.

## Final desktop density check and correction

After native review prompted a CSS-only density refinement, the existing first Availability case gained a 1280×720 check: all seven rows must be fully in view, both enabled and disabled states must be present, and their heights must match within 0.5px when no errors are shown.

```sh
MOBILE_RUNTIME_TEST_PORT=4191 npx playwright test tests/availability.spec.ts --workers=1 --reporter=line
```

This run passed **9/10 cases in 15.4 seconds**. All seven rows fit; the sole failure was a real one-pixel enabled/disabled height mismatch. A 36px input plus 20px vertical padding and a 1px border produced 57px enabled rows, while disabled rows retained a 56px minimum.

The implementation owner added a scoped 57px desktop minimum height. Only the failed case was then rerun on a fresh process:

```sh
MOBILE_RUNTIME_TEST_PORT=4191 npx playwright test tests/availability.spec.ts --grep 'independent weekday hours' --workers=1 --reporter=line
```

**1/1 passed in 2.8 seconds**, including seven fully visible, equal-height rows and the independent-hours/save/toggle/navigation checks. Together, the targeted run and corrected-case retry verify all ten distinct Availability cases. The full 49-case suite and 82 unit tests were not repeated after this CSS-only correction.

Final `npm run build` passed TypeScript, production Vite and Sites static-worker packaging. Explicit `npm run check:runtime` and the build's prebuild check both passed all **28 protected files**. Repository `git diff --check` passed.

## Native review and artifacts

The implementation owner's native in-app review completed teacher email onboarding through profile, French/A2, 45-minute lessons at €30, and review at step 8 of 8. It also saved independent Monday 10:00–17:00 and Tuesday 09:00–18:00 working hours. Supporting captures in this directory include:

- `onboarding-profile.png`
- `onboarding-review.png`
- `availability-daily-hours.png`
- `onboarding-before.png` and `profile-before.png`
- `search-desktop.png` and `search-mobile.png`, copied from the successful full browser run

Native captures precede the final one-pixel row-height correction. The original `qa/usability-feedback/desktop-search.png` and `mobile-search.png` were backed up before the full run, restored afterward, and verified byte-for-byte using SHA-256. The later Availability-only checks did not write those files. The verification agent changed tests and this record, with no product-source edits.

## Limits

Automated browser results are from local Playwright Chromium and the simulated iPhone/Pixel runtime. Native in-app review is separate from physical-device testing. These checks do not establish a comprehensive screen-reader/accessibility audit, every zoom/font configuration, or hosted deployment behavior. Deployment status and alias verification belong to the separate release record.

## Production release

The verified source snapshot was built as a staged production deployment and then promoted after checks. Deployment dpl_9u2udS6JoutqxPP9qSdPD2x6svwY is Ready/production. Vercel alias metadata confirms https://mimo-prototype-five.vercel.app maps to that deployment in the intended mimo-prototype project. All 223 source-manifest files matched the local worktree at promotion. The remote build passed its TypeScript/build and 28-file runtime integrity checks. Hosted pages were not fetched or re-tested. Inherited authentication remains enabled. Details are in deployment.json.
