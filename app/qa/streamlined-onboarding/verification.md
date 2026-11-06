# Streamlined onboarding and workspace — 5 November 2026

## Scope and baselines

- Preserved local work already present toward removing greeting-only screens, separating modules views and aligning footers, then completed grouped onboarding and validation.
- Prior committed teacher email/in-person route had 18 screens through teacher-review and 26 including full identity/completion. New core route has 8 through review. Identity checking is optional at this point and has its own 5-step document-preview or 2-step Persona-preview progress indicator.
- Optional hints, skill-focus assessment tags, dated evidence/progress views and before/after feedback comparisons remain deferred.

## Desktop browser checks

- Account includes email entry; bad@ disables email continuation. A wrong six-digit code shows the existing error; resend has a cooldown; Change email address returns to Account and accepts a replacement address.
- Google remains a sample-account confirmation. Back to Account from Google does not allow continuing with an empty email method or silently reuse the sample email.
- Profile groups display name/approach with optional media; subjects groups language/level selection; lesson settings group optional format/location with required duration/rate. €0 blocks continuation. Online removes the city field and clears the previous city.
- Review edits return directly with Save and return. An invalid name followed by Back blocks both verification/finish-later actions; correcting the name restores them without re-entering other details.
- Teacher document branch: impossible 31/04/2000 blocks continuation; valid sample name/date, country/type, sample document and sample selfie reach Welcome back, Alex Teacher! in the workspace.
- Ongoing modules: Review queue and Lessons by student are separate views. Queue search survives switching views. Noah has an empty assignment state; Léa shows only her assigned lessons.
- Editor footer top and sidebar separator top both measured y=640 at 1280×720. Sidebar footer starts at y=641 after the 1px separator.

## Phone browser checks

- Teacher Google preview → profile → languages/levels → lesson details → review → Finish verification later opens Welcome back, Maya! without an extra greeting/completion stop.
- Profile and languages/levels screens fit above their CTA in the checked iPhone preset. Text fields use the existing simulated keyboard components; tapping non-input content dismisses the keyboard. Optional media stays collapsed until requested.
- Learner Google minor branch rejects the learner's same email as guardian email, then requires the explicit guardian handoff. Sample Persona completion returns to languages.
- French and Spanish retain separate A1/B1 level selections. Combined goal, meeting preferences and optional extras reach a final summary with both languages/levels, personal goal, Online/Weekends/Morning and guardian Persona-preview status. Adult verification is not repeated.

## Checks and limits

- Production build and all 28 runtime hashes passed.
- 19 onboarding, 26 teacher, 5 routing and 4 Sites tests passed (54 total).
- The existing device-routing browser test expectations were updated from the retired greeting screen to role. Browser flow verification in this task used CUA, not a separate command-line browser runner.
- Upload size validation was preserved from the existing component; it was not failure-injected again. No real accounts, email, guardian consent, identity documents, camera, notifications or widget installation are connected. No physical-device or assistive-technology study was performed.

Screenshots: teacher-profile-phone.jpg, learner-summary-phone.jpg, review-queue-view.jpg, lessons-by-student.jpg; published proof is added at handoff.

## Publication

Sites version 8 succeeded at the existing public review URL. Published entry shows Choose your path before a role is selected; both Ongoing Modules view buttons are visible. Published editor/account divider measurements both equal y=640. Source app files in the Site checkout were copied from the verified fork checkout; the final Sites build/runtime and four worker checks passed. Proof: published-editor-alignment.jpg and published-module-views.jpg.
