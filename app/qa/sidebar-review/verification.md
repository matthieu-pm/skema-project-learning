# Sidebar, buttons and teacher review verification

Date: 11 November 2026. Evidence covers the current local worktree.

## Implemented changes

- Learner and teacher web workspaces share `WorkspaceSidebar.tsx`, built from the existing shadcn sidebar, dropdown, tooltip and Button primitives. It provides an expanded sidebar, a collapsed icon rail, one precise active destination, a primary action, support links and an account menu. Narrow web layouts use a navigation drawer that closes after navigation and restores focus to its trigger. Phone presentations retain their existing app navigation and protected device runtime.
- The shadcn Button in `src/teacher/ui/button.tsx` is the canonical action control. Teacher, learner and onboarding action wrappers preserve their existing callbacks and classes while using its variants and sizes. Buttons have restrained edges, 6px corners, optical icon padding and a solid 2px keyboard focus outline. Pointer presses scale to `0.96` over `150ms ease-out`; keyboard activation, static controls, disabled controls and reduced-motion mode remain stationary. Pointer release, cancellation, leaving the control, losing focus, window blur and a hidden document clear the held state. Window listeners exist only during a held press.
- Teacher onboarding step 8 groups Teaching profile, Languages and levels, and Lesson details into separate review sections with direct Edit actions. Saving a section returns to review, levels use canonical CEFR order, and unset, paid and explicitly confirmed free lesson terms remain distinct. Invalid required details still block progression after editing or Back navigation.

## Automated results

All **80 unit/worker tests** passed:

| Suite | Passed |
| --- | ---: |
| Onboarding | 24 |
| Teacher workspace and course editor | 31 |
| Learner workspace | 11 |
| Device routing | 5 |
| Location lookup | 5 |
| Sites worker and packaging | 4 |
| Total | 80 |

All **37 distinct browser cases** were verified, comprising **29 app-flow cases and 8 protected-runtime cases**:

| Browser coverage | Cases |
| --- | ---: |
| Button pointer, keyboard, static, reduced-motion and disabled behavior | 4 |
| Direct canvas editing, Properties synchronization, history, saving and phone keyboard | 4 |
| Device entry and routing | 3 |
| Dropdown selection, portal dialogs, empty values, disabled answers and native fallbacks | 7 |
| Teacher review editing and phone layout | 2 |
| Learner filters, booking, reviews and competing checkouts | 4 |
| Learner onboarding on web and phone | 2 |
| Shared sidebar routes, collapse, account menu and narrow drawers | 3 |
| Protected carousel, sheet, keyboard and FlowStack behavior | 8 |
| Total | 37 |

The full browser run used a fresh current-worktree server on port 4184 and one worker:

```sh
MOBILE_RUNTIME_TEST_PORT=4184 npx playwright test --workers=1 --reporter=line
```

That run passed 36 of 37 cases. The empty-editor test's unscoped New lesson locator matched both the new sidebar action and the existing page action. The test was scoped to `.teacher-web .tw-content`; no application fix was needed for this failure. A subsequent targeted run of all eight button and direct-editor cases passed, including the corrected case and the final icon-padding refinement. The 37-case result therefore combines the full run with that targeted rerun. All eight protected-runtime cases passed in the full run.

The focused Button checks measured a held pointer scale of `0.96`, restoration to `1` after release and window blur, a stationary Space-key activation with a solid 2px `#171717` outline, a stationary static collapse control, and no movement or flow advancement from disabled actions. Reduced-motion primary actions also stayed at scale `1`.

`npx tsc --noEmit`, the fresh production build, all **28 protected-runtime hashes**, and `git diff --check` passed. The build also prepared the Sites worker output; its four packaging/worker tests passed.

## Native in-app browser checks

The native in-app browser review confirmed the teacher's expanded and collapsed sidebar, the learner sidebar, and keyboard account-menu navigation with ArrowDown, Escape and focus restoration. It also exercised teacher step 8: Edit languages and levels, add C1, then Save and return, with the updated levels displayed in canonical order.

Captured evidence:

- `teacher-sidebar.png`: teacher sidebar.
- `teacher-account-menu.png`: teacher account menu.
- `learner-sidebar.png`: learner sidebar.
- `teacher-review-web.png`: teacher step 8 review.
- `desktop-search.png` and `mobile-search.png`: refreshed search captures from the automated checks.

The existing search screenshots in `qa/usability-feedback/` were restored byte-for-byte after capture; the current copies are retained in this directory.

## Verification limits

These are local browser and simulated-device checks. Physical iPhone/Android hardware, a full screen-reader audit, exhaustive viewport and text-zoom combinations, and slowed frame-by-frame motion playback were not verified. The prototype's account, identity, publishing and communication boundaries remain unchanged; browser-local state is not evidence of connected services or cross-device delivery. Hosted deployment verification is outside this local evidence record.
