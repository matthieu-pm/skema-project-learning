# Mimo Start & Setup QA — 2026-10-01

## Sources and scope

Content: Figma section `w4nc4L3hNF63uh2HBX9Np5 / 7:22`, all eight child frames, with mapping at `../reference/figma/flow-map.md`. Visual reference: the existing Mimo implementation and its original Mobbin comparisons in `qa/`. The earlier report is retained at `qa/original-design-qa.md`; it describes the superseded Duolingo-only flow.

## Rendered verification

The actual local app was exercised in Codex's browser:

- Learner account setup, incorrect and correct six-digit codes, language search including no results, French, A2, everyday-life context, free-text goal, practice goal, meeting preferences, reminders/widget skips and completed summary.
- Back navigation preserved the meeting choice; choosing Online then skipped city.
- Both weekday and weekend choices were selectable together; skipping time produced Flexible time in the summary.
- Teacher path through display name, local image selection/preview, two languages, two levels, approach, in-person format, city, duration, price and profile review.
- Zero price blocked progression; valid €30 / 45 minutes appeared in the profile review.
- Under-18 guardian handoff, blocking the same email and accepting a distinct example email.
- Teacher draft exit and Back return; sample document and selfie sequence to completion.
- Text fields used the simulated keyboard. Goal-entry screenshot verifies the anchored CTA above it.
- iPhone and Pixel layouts inspected. Compact 390 × 844 viewport checked for horizontal overflow.

## Visual findings and fixes

An initial FlowStack screen was transparent, allowing a parked introduction to show through. App-scoped opaque screen backgrounds fix this without modifying the protected runtime. Parked content is inert and hidden from accessibility. Choice cards, Nunito typography, green raised buttons, blue selections, Mimo and speech bubbles retain the established design. Teacher level descriptions use proficiency labels instead of learner first-person statements.

The new screenshots in `qa/step-update/` cover role selection, goal entry with keyboard, meeting format, availability, learner completion, teacher review and Pixel rendering. Original source comparisons remain in `qa/` for the unchanged design language.

## Limits

This is a frontend preview with session state only. Email, guardian consent, identity verification, notifications and widgets are simulated. Files are local object URLs. Teacher discovery, bookings and backend persistence are outside this onboarding change. Learners have a guardian handoff when under 18. Teachers enter date of birth during verification; production age eligibility is not defined here.

## Final automated checks

Passed: all 6 onboarding routing/validation tests; TypeScript and Vite production build; integrity hashes for all 28 protected runtime files. Browser warning/error log was empty at final inspection. Compact viewport measured 390px content and 390px scroll width. Preview remains running with the role-selection screen open.

## Teacher palette and companion update

Teacher mode now uses blue #1cb0f6 primary controls, darker blue raised shadows, and orange option selections. It uses the original supplied `pets/nori.png` asset; learners keep green Mimo and their existing palette. Existing routing and ID-verification screens are unchanged. Verified role switching in the rendered app, with blue teacher and green learner button backgrounds. All 6 route tests, production build, and runtime integrity checks pass.

## Screen fit update

Removed the duplicate large companion on teacher completion/draft pages. Compact language rows/search spacing and inline CEFR descriptions keep dense option lists above the fixed CTA. Kept MobileScroll available for keyboard and unusually long content. Visited teacher language and level screens measured 744px content within a 744px scroll viewport (zero overflow) with the keyboard closed. Teacher completion was observed with a single companion, summary and final notice; the live preview was replayed before a stable geometry capture could be saved. Production build and all protected runtime hashes pass.


## Teacher date of birth

Teachers go directly from email to the code screen, while learner age/guardian routing is preserved. Date of birth is a separate verification step between legal name and issuing country. Day/month/year formatting works with numeric entry. Invalid calendar and future dates block Continue; no new minimum-age policy is imposed. Verified in-browser: 31/02/2000 rejected, 15061995 formatted as 15/06/1995, valid progression to country, and Back restores the date. All 8 route/date tests, production build and runtime integrity checks passed. No provider receives this local preview data.

## Purple learner theme

Learner/default primary controls, progress highlight, action text and wordmark now use purple; Luma replaces the green Mimo illustration throughout the learner path, and the greeting names Luma. Teacher blue/orange and Nori remain intact. Browser role-switch checks confirmed learner primary #9955e8 and teacher primary #1cb0f6, with the corresponding companion. Production build and protected-runtime checks pass. Capture: `qa/step-update/learner-purple-luma.png`.


## Learner practice removal, notifications and widget

Removed daily-goal data, validation, routine/goal/commitment screens and minutes-per-day summary. Preserved personal learning objectives. Renamed reminder state/route to notifications and changed the prompt to Allow notifications / Not now. Updated habit copy and replaced the widget day count with Luma’s “You’ve got this!” speech bubble. Reduced widget artwork/spacing. Browser verified direct encouragement → meeting format progression, general notification approval → widget, and widget scrollHeight = clientHeight = 744px (zero overflow). All 9 route/date tests pass; final production build and runtime integrity pass.

## Learner and guardian identity verification

Reused the identity sequence after learner benefits: legal name, date of birth, issuing country, document type, sample document and sample selfie. Under-18 learners first see an explicit handoff to the parent or guardian; copy requests the adult’s details. Finish later returns to learner summary with a pending label instead of the teacher draft. Age changes clear identity fields and guardian state.

Browser verified both adult and guardian completion paths and guardian deferral. Adult and guardian introduction pages each measure 744px scroll content in a 744px viewport; the guardian completion page also fits. Captures: `qa/step-update/learner-verification.png` and `qa/step-update/guardian-verification.png`. All 11 routing/validation tests, TypeScript production build, and 28 protected runtime checks pass. Identity actions remain local simulations.

## Earlier guardian verification

Moved the guardian handoff and complete identity sequence immediately after email-code verification. Completion and Finish this later both continue to language selection; benefits now leads directly to the learner summary for under-18s. Adult learner and teacher ordering is unchanged. Updated regression assertions check the exact early sequence, both exits, and one occurrence of each verification screen. All 11 tests and production/runtime checks pass. Browser verified email code → guardian handoff, deferral → language, and full sample verification → language. Capture: `qa/step-update/guardian-early-handoff.png`.

## Multiple learning languages

Learners can toggle multiple languages with checkboxes; Continue requires at least one. Removed learner search and added ‘More languages coming soon!’ Each language has its own level route, validation and summary entry. Deselecting a language clears its level. Teacher search is unchanged. Browser verified French + Spanish selections, French A1 → Spanish B2 → learning context, and Back restoring French A1. Language selection fits 744px content in a 744px viewport. All 12 route tests and production/runtime checks pass.

## Persona ID shortcut (2 October 2026)

Added a shared Link Persona ID option on verification introduction with the supplied logo. A separate sample-link screen explicitly states no real account is connected; its completion skips the document/selfie screens and resumes the appropriate actor branch. A document fallback remains available. All 13 routing/validation tests and production/runtime checks passed. Browser verified the guardian Persona screen, document fallback to legal name, and Persona completion returning to language selection. Guardian introduction fits 744px/744px with the new option.
