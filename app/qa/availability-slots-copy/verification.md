# Multiple availability slots and copy-hours verification

Verified locally on 11 November 2026 in the `2432/skema-project-learning` worktree.

## Implemented behavior

- Each weekday owns an enabled flag and independently editable time slots with stable IDs. Add focuses the new slot's start field; removal affects only that slot and returns focus to Add. The final slot cannot be removed through the UI. Switching a day off retains all its slots.
- Enabled slots require valid start/end times and an end after the start. Overlap within a weekday is rejected; adjacent intervals are allowed. Invalid enabled days block saving and copying, with weekday-specific recovery. Disabled retained ranges do not block saving.
- Copy hours opens a desktop popover or phone-scoped BottomSheet. The source is excluded from target selection. Select all days supports checked, unchecked and mixed states; copying is disabled without targets. Only the explicit Copy hours action replaces and enables selected target days, with fresh independent slot IDs. Selection, Cancel and Escape do not change hours or saved state.
- Europe/Paris-only saving, offline draft/retry behavior, no profile-price gate, in-memory scope and preservation of confirmed bookings remain. No backend, persistent availability, learner/calendar synchronization, date exceptions or additional time zones were added.

## Initial full unit and scoped browser checks

All **84 unit/worker tests passed**:

| Suite | Passed |
| --- | ---: |
| Onboarding | 24 |
| Teacher workspace and editor | 35 |
| Learner | 11 |
| Device routing | 5 |
| Locations | 5 |
| Sites worker | 4 |
| Total | 84 |

The existing `npm run test:*` scripts ran independently. Production build/typecheck, Sites packaging, all 28 protected runtime hashes and repository `git diff --check` also passed.

Fresh-process browser command:

```sh
MOBILE_RUNTIME_TEST_PORT=4192 npx playwright test tests/availability.spec.ts tests/select-control.spec.ts tests/mobile-runtime.spec.ts --workers=1 --reporter=line
```

**All 28 cases passed on the first run in 42.8 seconds**:

| Browser coverage | Passed |
| --- | ---: |
| Availability | 13 |
| Shared selects | 7 |
| Protected mobile runtime | 8 |
| Total | 28 |

Availability coverage includes multiple-slot creation/removal, stable remaining values, off/on retention, adjacent intervals, overlap and missing-time recovery, invalid-source copy prevention, replacing two targets including a disabled day, independent source/target edits, unaffected weekdays, no-target disabling, Select all/mixed state, cancellation/Escape and focus return. Existing Paris/offline/profile/booking-preservation checks remain. Layout checks cover default rows at 1280×720, two-slot add/copy controls at 1024px, narrow web at 390px, and both iPhone and Pixel presets with native selects, keyboard reveal/dismissal, phone copy sheets, focus restoration and reachable saving.

The scoped run did not repeat unrelated onboarding, sidebar, button or editor browser journeys. Their prior release evidence is separate.

## Native finding and final CSS correction

Native in-app WebKit review at 1280×720 found that the desktop copy popover could open with its footer below the initially visible content. Playwright's normal action auto-scroll had allowed the earlier interaction tests to pass without detecting this initial layout problem.

The implementation owner corrected only desktop-popover CSS: bounded flex-column content, a scrollable target list with a shrinking minimum, and non-shrinking header/footer/option rows inside the available popover height. The phone sheet was unchanged.

The affected existing tests gained assertions that Cancel and Copy hours are fully in the viewport and inside the popover immediately after opening, before any footer click can auto-scroll. They check 1280×720 and 1280×520, use real wheel scrolling to reach Sunday and return to the top, preserve checkbox state, and verify the footer remains visible. The narrow-web/1024px case also checks the initial popup footer.

Only the three affected cases were rerun:

```sh
MOBILE_RUNTIME_TEST_PORT=4192 npx playwright test tests/availability.spec.ts --grep 'copying slots|copy selection|narrow and 1024px' --workers=1 --reporter=line
```

**3/3 passed in 9.5 seconds.** Final `npm run build` passed TypeScript, production Vite and Sites static-worker packaging. Explicit `npm run check:runtime` and the build's prebuild check both matched all **28 protected files**. Final repository `git diff --check` passed.

The full 28-case scoped run and 84 unit tests were not repeated after this CSS-only correction.

## Native proof and artifacts

The implementation owner's native in-app WebKit review entered Monday 09:00–12:00 and 14:00–17:00 using native keyboard commits, selected Tuesday and Wednesday in the copy popover with Select all mixed, and applied Copy hours. Tuesday's former 09:00–17:00 range was replaced; Wednesday was enabled with both intervals. Monday remained unchanged. Save confirmed Saved, and all twelve time-field values across the three days were checked through the accessibility tree.

Supporting captures:

- `copy-menu.png`
- `split-hours-saved.png`

The existing original search captures in `qa/usability-feedback` remain byte-identical to their preserved SHA-256 values. These scoped specs do not write those captures. The verification agent changed tests and this record, with no product-source or protected-runtime edits.

## Limits

Automated results are from local Playwright Chromium and the simulated iPhone/Pixel runtime. Phone sheet, keyboard and focus behavior were verified by those automated cases; no native phone or physical-device test is claimed. Native desktop WebKit review is additional evidence, not a comprehensive accessibility, zoom/font or screen-reader audit. Hosted build, deployment readiness and production alias checks are recorded separately.

## Final sidebar and annotation follow-up

Before production staging, the user requested centering the collapsed account avatar and moving the collapse/expand control into the content header before the workspace breadcrumb. Both teacher and learner web headers now own that static control. Narrow web retains Open navigation in the header and Close navigation inside the drawer. The account trigger uses the canonical Button, displays the name without Teacher/Learner account role copy, and centers its avatar in the 64px rail.

The lesson-library tab now displays Drafts while retaining its existing internal draft-filter value and New lesson route. Actual editor titles and breadcrumbs remain Module editor. The preview action row and following personal-adaptation card also gained the requested spacing.

Focused command on a fresh server:

```sh
MOBILE_RUNTIME_TEST_PORT=4193 npx playwright test tests/workspace-sidebar.spec.ts tests/button-interactions.spec.ts --workers=1 --reporter=line
```

The initial seven-case run passed all four button cases. Two sidebar cases measured the earlier 5px avatar offset before the last centering correction. The narrow teacher case exposed a test-helper assumption: the workspace label is intentionally hidden at that width, so its bounding box is unavailable. The helper now retains header/DOM-order checks on narrow web and checks breadcrumb geometry when the desktop label is visible.

After the implementation owner's final centering CSS correction, only the three sidebar cases were rerun:

```sh
MOBILE_RUNTIME_TEST_PORT=4193 npx playwright test tests/workspace-sidebar.spec.ts --workers=1 --reporter=line
```

**3/3 passed in 6.9 seconds.** Together with the four passing button cases, all seven distinct follow-up cases were verified. They cover header placement before the breadcrumb, no internal desktop collapse button, the same trigger node and dimensions across collapse, teacher portrait and learner initials avatar centers within 0.5px of the 64px rail center, expand/collapse, tooltips, keyboard account menus, drawer dismissal/focus return, absent role copy, Drafts selection and no horizontal overflow. The button cases retain pointer-only press/release, keyboard/static behavior, reduced motion and disabled-control checks.

The final production build/typecheck, Sites packaging, explicit 28-file runtime check, prebuild runtime check and repository `git diff --check` passed after all source refinements. Availability/model/unit suites were not repeated for this unrelated sidebar and spacing follow-up.

The implementation owner's final native review measured the teacher avatar center at 32px in the 64px rail and exercised the header toggle in both directions. It confirmed the Drafts tab and unchanged Module editor breadcrumb, and measured exactly 24px between the preview action bottom (586.78px) and the following card top (610.78px). Additional captures are `sidebar-collapsed.png` and `preview-spacing.png`. No dedicated spacing test or physical-device verification is claimed.

## Ongoing modules sticky-view follow-up

The user subsequently requested keeping Review queue / Lessons by student pinned while scrolling. Native review found that the earlier sticky rule left the scroll owner's 40px top padding above the switcher, allowing review content to appear in that gap. The fix moves the initial responsive top inset into a page wrapper while keeping the scroll owner's top padding at zero for this route. The view strip now pins directly below the toolbar at every web width; true-phone flow is unchanged.

Only the new parameterized regression ran:

```sh
MOBILE_RUNTIME_TEST_PORT=4194 npx playwright test tests/module-views.spec.ts --workers=1 --reporter=line
```

**3/3 passed in 4.8 seconds** at 1280×720, 1024×720 and 390×640. Real wheel input scrolls the workspace pane twice; the review rows continue moving while the view strip remains flush with the toolbar bottom. Both buttons remain fully visible, Lessons by student can select Lucas Bernard, returning to Review queue works, and no horizontal overflow is introduced. An initial test-only student-row selector was corrected to assert the accessible selected combobox value; no product-source change was needed for that correction.

Production build/typecheck, Sites packaging, all 28 protected runtime hashes and final `git diff --check` passed for the final product source. The existing 35 distinct browser-case evidence above is preserved; this follow-up ran only the three new viewport cases, with no unrelated suite repeat.

The implementation owner's native in-app review at 1796×1034 measured the scroll-owner top, toolbar bottom and pinned switcher top at exactly 64px after wheel scrolling to scrollTop 305. No review content appeared above the strip, and the pinned Lessons by student control switched views successfully. Capture: `ongoing-modules-sticky.png`. This remains local browser evidence, with no physical-device or hosted-flow claim.
