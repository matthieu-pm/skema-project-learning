# Prototype feedback adjustments

Implemented locally on 11 November 2026 on `dev/prototype-feedback-adjustments`.

## Source and scope

The user requested implementation of `/Users/matthieu/Downloads/mimo-prototype-adjustments.md`. [feedback.md](feedback.md) is an unchanged reference copy of that product specification, not an agent-instruction source. This request did not authorize another merge or deployment.

The current Mimo/Cal.com-inspired design, responsive layouts, protected device runtime, Properties panel location and Lessons tab structure are preserved. The proposed panel relocation and Library / Drafts / Lesson templates / Archive redesign are outside this implementation.

## Implemented behavior

- The existing teacher role screen communicates editable/reusable lessons and real student connections before sign-up, without adding a screen.
- Optional Language teaching experience is available during onboarding and in Teaching profile; it can be saved, revisited, edited and cleared.
- A shared searchable language picker supports multiple languages, independent CEFR levels, removal, duplicate prevention, no-match guidance and accessible keyboard selection. Every selected language requires a level. Legacy shared levels migrate to the selected languages without losing existing answers.
- Existing Decide later options retain an accessible checked state and clear mutually exclusive specific meeting formats. The two teacher verification statements are plain informational text.
- Relevant labels now read Lessons for students, Lesson editor, Lesson templates, Save draft and Use lesson. Unrelated profile Save changes remains unchanged.
- Custom module title and module goal are optional. An empty title displays the module type, or Custom section; an empty goal is omitted from student preview. Lesson title/goal, module type and block-content requirements remain.
- Save draft allows incomplete private work, confirms only successful browser-local persistence and does not create assignments or templates.
- Use lesson starts with both choices unchecked on every opening. Assignment and template creation are independent, with conditional fields, precise primary labels, inline errors/focus, cancellation/focus restoration, mobile scrolling and keyboard clearance. Hidden options do not validate or create side effects. Busy state prevents duplicate submissions.
- Assignments and templates are independent deep-cloned copies. Future draft/template edits cannot mutate an assigned snapshot. Combined actions use one atomic localStorage write, so failed persistence produces neither action and retains the dialog inputs for retry.

Implementation decision: assigning the same source lesson to the same student again is blocked with guidance to create a separate lesson copy. Existing assigned work is never silently replaced. Assigning the source to a different student creates another independent copy.

## Prototype boundaries

Teaching-profile saving retains the existing preview/session-state behavior. Lesson drafts, assignment copies and lesson templates are browser-local. Assignment/template notices and success messages explicitly identify simulated behavior; no student is notified, and no backend delivery, cross-device synchronization or real enrollment service was added. Existing booked-session preparation remains its separate sourced prototype flow.

## Verification

- TypeScript, production build and all 28 protected runtime hashes passed.
- 96 unit/worker tests passed, including six new feedback-focused tests for language state, optional fields, readiness, immutable copies, duplicate assignment and atomic/error persistence.
- All 37 production-build browser checks passed, including six new web/phone tests. Coverage includes onboarding/back-navigation, search and missing-level focus, experience editing/clearing, Decide later, verification presentation, all four Use lesson states, hidden-field behavior, incomplete draft reload, optional module preview, snapshot safety, duplicate assignment and failed combined saving.
- Manual in-app review covered the desktop dialog, Teaching profile language picker and phone pre-sign-up value screen. Both benefits fit above Continue on the phone; existing blue/orange onboarding treatment and neutral/purple workspace styling remain. Manual dialog review did not submit either simulated action.
- Existing regression screenshots were restored after automated capture; previous release notes and hosted evidence were preserved. Physical-device and hosted verification were not performed for this local revision.

## Evidence and review

- [Use lesson, desktop](use-lesson-desktop.jpg)
- [Teaching profile language picker, desktop](language-picker-desktop.jpg)
- [Teacher value before sign-up, iPhone](teacher-value-iphone.jpg)
- Local editor: `http://localhost:4175/?teacher=1&view=web&flow=editor&lesson=cafe`

New logic lives in `src/TeacherLanguagePicker.tsx` and `src/teacher/lesson-use.ts`, with onboarding/profile/editor integration and atomic persistence in `src/teacher/course-storage.ts`. New coverage lives in `tests/prototype-adjustments.test.mjs` and `tests/prototype-adjustments.spec.ts`.


## Production release follow-up

The user subsequently authorized commit, push and deployment. Implementation commit [`c1d9057`](https://github.com/matthieu-pm/skema-project-learning/commit/c1d9057aec9d8d3f3e9f59111510086f82627a9c) is pushed on `dev/prototype-feedback-adjustments`. That exact Git SHA was deployed directly to production, without merging main, as `dpl_7a76R3bCX9Y4CxTtyWiXemv8zCpQ`. Vercel reports Ready, no alias error, and [the production domain](https://skema-project-learning.vercel.app) assigned. Fresh release checks again passed 96 unit/worker tests, all 37 production-browser tests, build and all 28 protected runtime hashes.

Hosted desktop checks verified the current labels, both choices initially unchecked, disabled initial primary action, independent conditional fields, snapshot notice and combined primary label. Hosted iPhone checks verified the editor labels, default Use lesson dialog and cancellation. Neither page emitted browser warnings/errors. No assignment/template was submitted; all persistence/simulation limitations above still apply. Captures: [production desktop](production-desktop.jpg) and [production iPhone](production-iphone.jpg).
