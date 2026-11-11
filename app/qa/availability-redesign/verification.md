# Availability and sidebar verification

Verified locally on 11 November 2026 in the `2432/skema-project-learning` worktree.

## Implemented scope

- Teacher Availability now presents the shared daily time range above seven full weekday rows, with accessible switches and each day's derived hours or Unavailable state. Time zone and existing-booking information sit alongside the weekly form on wide screens and follow it on phones. The heading contains one Save action and an explicit Unsaved changes / Saved status.
- Availability retains its existing behavior: at least one selected day, both times, and an end after the start are required. Only Europe/Paris can be saved. Connection failures retain the draft for retry, and changes reset the saved state. Missing teaching duration or price does not block availability saving. Existing confirmed bookings are preserved.
- The shared teacher and learner web sidebar now places its account menu above the primary action, removes the visible Mimo wordmark, and keeps support links in the footer. The 248px expanded sidebar, 64px collapsed rail, precise active destination, keyboard menus and narrow-web drawer behavior remain.

Availability remains workspace memory state; this redesign does not add persistent availability storage, calendar or learner-booking synchronization, per-day time ranges, or additional supported time zones.

## Browser evidence

Command, using a fresh local Vite process and one worker:

```sh
MOBILE_RUNTIME_TEST_PORT=4188 npx playwright test tests/availability.spec.ts tests/workspace-sidebar.spec.ts --workers=1 --reporter=line
```

**12/12 passed in 18.1 seconds:**

| Coverage | Cases |
| --- | ---: |
| Availability | 9 |
| Shared workspace sidebar | 3 |

The Availability cases verify:

1. Selected days and hours save successfully; later edits restore the unsaved action and survive navigation away and back.
2. No selected days, missing start/end, equal times and reversed times cannot save; correcting the values permits recovery.
3. An unsupported time zone disables saving; keyboard Escape restores focus without changing the selection, and returning to Europe/Paris preserves edited hours and allows saving.
4. Turning Connection available off through Account settings prevents saving without losing edits; reconnecting allows an explicit retry.
5. Availability can still save after teaching duration and price are cleared and the incomplete profile is saved.
6. Reducing availability to Monday, 07:00–08:00, leaves every existing confirmed calendar booking's accessible date, time, duration and status unchanged.
7. A 390×640 web viewport supports Space/Enter day toggles and reachable saving without horizontal overflow.
8. The iPhone preset retains native time-zone selection, reveals a focused time field above the simulated keyboard, dismisses the keyboard on blur, and allows saving above the navigation footer.
9. The Pixel 10 preset passes the same native-selection, keyboard, overflow and save-reachability checks.

The three sidebar cases verify the account is above the primary action and no Mimo wordmark is visible in teacher/learner desktop and narrow drawers. They also cover expanded/collapsed widths, active destinations, support-footer reachability, teacher and learner keyboard account menus, ArrowDown/Escape focus restoration, and drawer dismissal/focus return after navigation.

After the 12-case run, three explicit Unsaved changes → Saved → Unsaved changes assertions were added to the existing first Availability case. That case was rerun against the final token-only CSS cleanup and passed **1/1 in 2.1 seconds**. The cleanup changed colors and removed the switch-thumb shadow without changing sizing or state behavior; the other eleven cases were not repeated afterward.

## Final source checks

| Check | Result |
| --- | --- |
| `npm run test:teacher` | 31/31 teacher model/editor tests passed |
| `npm run build` | TypeScript, production Vite build and Sites static-worker packaging passed |
| `npm run check:runtime` | All 28 protected runtime files matched their hashes |
| Build's prebuild runtime check | All 28 protected runtime files matched again |
| `git diff --check` | Passed |

The focused browser specs do not write search captures; existing `qa/usability-feedback` images were left untouched. The verification agent made no product-source changes.

## Evidence limits

These automated checks cover the local app and its simulated iPhone/Pixel runtime in Playwright Chromium. They do not establish physical-device behavior, a full accessibility or screen-reader audit, or hosted deployment behavior. Broader onboarding/learner/unit suites, standalone button interactions and the complete protected runtime browser suite were not repeated for this scoped change. Native in-app visual review and research-board evidence are outside the automated results above.

## Native visual review and comparison

Native in-app review on the current local server confirmed the weekly row layout, distinct time-zone column, account-led sidebar without the wordmark, expanded/collapsed navigation, and ArrowDown/Escape account-menu focus restoration. Space toggled Wednesday; native ArrowUp time editing changed the controlled shared value and every selected row; saving updated the saved state, and further edits restored the dirty state. A direct automation fill on the native time control updated only its displayed DOM value; native keyboard stepping committed through React, so the verified time edit uses that actual keyboard interaction. No application workaround was added.

The final before/after images use matching initial weekdays and 09:00-17:00 values at 1280x720. The original source was run from the preserved verified snapshot on temporary local port 4189; the current app was reviewed on port 4183. The comparison uses browser-measured rectangles and the supplied board template, captured at its supported 2x zoom with loaded images/fonts. Both panes are embedded into board.html so it can be opened independently. Artifacts: before.png, after.png, comparison.png, board.html and references.md. The temporary baseline server was stopped after review. Current changes remain local; the production deployment was not updated in this task.
