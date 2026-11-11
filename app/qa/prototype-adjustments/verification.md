# Prototype adjustments verification

Verified locally on 11 November 2026 against the user-supplied [implementation handoff](./feedback.md). No Git publication or deployment was performed for this task.

## Scope and acceptance coverage

| Feedback | Implemented behavior and checks |
| --- | --- |
| 1.1 Platform value | Existing entry screen presents editable/reusable lessons and in-person/online connections before account creation. New desktop, iPhone and Pixel flows check both benefits and reachable sign-up/account actions; desktop exercises the existing-account path and returns before signing up. No extra greeting step was added. |
| 1.2 Teaching experience | Optional multiline Language teaching experience transfers from setup/review into Teaching profile. Tests leave it blank initially on both phone paths, add it during review editing, then save, revisit, clear and reopen it in Teaching profile while retaining name, lesson terms and language levels. Profile persistence remains the existing in-memory workspace session; reload persistence is not claimed. |
| 1.3 Languages and levels | Shared searchable multiselect supports keyboard selection, distinct per-language CEFR levels, removal and missing-level guidance/focus. New flows check French A2 versus German C1, no-match query/selection retention, missing levels for each language, removal/re-add without affecting the other language, review transfer and later profile validation. Unit coverage checks migration from prior global levels. |
| 1.4 Decide later | Teacher-format deferral has a visible check and persistent `aria-pressed` state. New flows verify mutual exclusion with Online and retention after editing from review. |
| 2 Verification information | Both statements are plain, nonfocusable information outside the old card treatment. Tests verify the real Persona action remains; native review also checked genuine verification actions. Existing identity/booking rules remain. |
| 3 Ongoing modules | Lessons for students replaces the visible/accessible switcher label. Existing three-width tests retain view switching, student selection, review queue and normal page scrolling at 1280/1024/390px. |
| 4 Terminology and drafts | Lesson editor, Lesson templates, Save draft and Use lesson appear in their intended contexts. Existing selector migrations retain the original behavior assertions. A new test checks Preview lesson → Save draft → Use lesson order and persists/reloads an unfinished private draft without assignment/template side effects. Teaching profile still uses its unrelated Save changes action. |
| 4.2 Optional module fields | Browser checks save blank title/goal, show the Warm-up fallback in outline/student preview, and successfully assign/template the valid lesson with those optional fields empty. Course unit tests cover optional fields/fallbacks while retaining required lesson and block validation. |
| 5 Use lesson | Four new cases cover all checkbox states/action labels, current-title prefill and edited-name retention, hidden unchecked fields, inline error focus, three cancellation paths, focus return, no action on opening, template-only/assignment-only/combined effects, storage failure/retry, processing guards, immutable assigned versions and phone usability. Details follow below. |

## Use lesson safety

The prior editor had no duplicate-assignment guard and could replace its single assigned snapshot. The implementation now creates a separate assignment record with `sourceId`, student ID and a cloned validated course. The policy is explicit: the same source lesson cannot be assigned again to that student; create a separate lesson for new material. Existing assigned content and work are preserved. Reusable templates are separate copies; private Save draft does not assign or create a template.

Draft, optional assignment and optional template are committed together in one browser-local library write. Combined actions therefore succeed or fail together; partial-success retry is not applicable. Browser coverage injects a real storage-write failure, checks unchanged storage and retained inputs, retries once, and verifies exactly one assignment/template. A held Web Lock checks disabled processing controls and blocked Escape before committing. Later Save draft leaves the assigned record unchanged; duplicate assignment is rejected with field focus, and a different student can receive a separate version without another template.

The dialog retains the requested honest prototype notice and qualified simulated success. No actual student access, notification, backend publication or server persistence is implemented or claimed.

## Final automated evidence

- **31 distinct affected browser cases passed** on final source in two coordinated serial runs: **27/27** at fresh port 4201 in 1.2 minutes, and **4/4 Use lesson cases** at fresh port 4202 in 14.6 seconds.
- The 27-case run includes four new onboarding/profile/private-draft acceptance cases and 23 existing regressions: teacher review 2, direct editor 4, button interactions 4, selects 7, shared sidebar 3 and module views 3. The separate Use lesson run adds the remaining four new acceptance cases. Total new cases: **8**.
- Root's complete unit/worker run passed **113/113** on frozen logic. The two subsequent source changes were app-owned phone focus-reveal observers; no model/persistence logic changed afterward.
- Root's final `npm run build` passed TypeScript, Vite and Sites packaging **after both phone focus fixes**. All **28 protected runtime hashes passed**. Final `git diff --check` passed.
- One additional desktop case passed **1/1 in 3.8 seconds** on fresh port 4203 solely to produce the two QA captures below. This repeats an already-counted case and does not increase the distinct-case total. No product code changed for the capture rerun.

Commands for the final browser runs:

```sh
MOBILE_RUNTIME_TEST_PORT=4201 npx playwright test tests/prototype-adjustments.spec.ts tests/teacher-review.spec.ts tests/course-editor-inline.spec.ts tests/button-interactions.spec.ts tests/select-control.spec.ts tests/workspace-sidebar.spec.ts tests/module-views.spec.ts --grep-invert 'prototype-adjustments.*Use lesson' --workers=1 --reporter=line
MOBILE_RUNTIME_TEST_PORT=4202 npx playwright test tests/prototype-adjustments.spec.ts --grep 'Use lesson' --workers=1 --reporter=line
MOBILE_RUNTIME_TEST_PORT=4203 npx playwright test tests/prototype-adjustments.spec.ts --grep 'separates choices' --workers=1 --reporter=line
```

Initial checks found two real phone issues: Teaching profile's experience field and the Use lesson Template name field could remain below the settled keyboard. The first non-Use run was 2/4 in 40.7 seconds; both phone cases failed the profile geometry assertion. The first Use run passed its desktop cases but both phones failed the dialog geometry assertion. The owners added scoped app-only focus reveal using the existing keyboard insets and resize observations. Final runs passed without weakening those assertions. Protected runtime files were unchanged.

## Native review and visual proof

Root's native in-app WebKit review at 1280×720 checked onboarding value/account entry, local Google choice, experience, keyboard French A2/English B1 selection, failed continuation with per-language error/focus, grouped review values, selected Decide later after edit/return, and plain verification information with real actions. HMR reset this native session before transfer to the workspace; native profile clearing is **not** claimed. The automated cross-flow cases verify that transfer and clearing.

After the editor froze, native desktop review checked all four Use lesson states, missing-student error/focus, custom template name, hiding unchecked fields, Keep editing cancellation/focus return and reopening with both choices unchecked. No native assignment/template submission or storage write was performed. The later dialog focus fix affects phones only.

The following final automated captures were visually inspected. Both show the actual desktop dialog at 1440×1000, with controls readable and contained:

- [Default unchecked choices](./use-lesson-default.png)
- [Both options selected](./use-lesson-both-options.png)

Phone tests use the protected iPhone and Pixel preview presets in Playwright. They check focused fields against the **settled** keyboard, relevant fixed navigation, reachable dialog actions, native Student selection, cancellation and focus restoration. This is not physical-device or native-phone visual verification. No broad unrelated browser suite was repeated.

## Preserved QA assets

The screenshot-writing learner usability tests were not run. Original search images were unchanged before/after verification:

| Capture | SHA-256 |
| --- | --- |
| `qa/usability-feedback/desktop-search.png` | `f54425180b6e6810cf4e34798f27bfa4d9909449308e6de8a6038d29eecd72ee` |
| `qa/usability-feedback/mobile-search.png` | `aa474f59ce41b03053a66f4de0a0e3cf76aafed46beafe8b6026ff65921e0fd7` |

No unresolved blocker remains in the checked scope. Profile persistence remains session state; lessons/templates/assignments remain simulated browser-local data. Unrelated learner preparation, public teacher curriculum, research assets and production deployment state were preserved.
