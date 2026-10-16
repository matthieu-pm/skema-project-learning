# Web onboarding verification — 10 October 2026

Latest design source: [Uxcel onboarding on Mobbin](https://mobbin.com/flows/452191b8-996a-4e8e-a17b-691e5c04f042). The connector returned the exact 23-screen flow; inline samples at positions 1, 7, 12, 18 and 23 were inspected. Mimo borrows the centered single-step format, slim top progress and fixed bottom action rail. Uxcel's course, career, daily-goal and subscription content is not part of Mimo.

Entry points: `/?view=web` for web onboarding; `/` for the original phone onboarding. Both use the same answers, screen content, actions, routing and validation. Web workspace Replay links now preserve the web presentation.

Rendered checks:

- Teacher email route: introduction → role → account → email/code → teacher introduction → name → optional photo → teaching languages/levels → approach → online format → duration → price → review → separate document identity steps → sample selfie → web workspace. Name, French/A1, approach, €35/45 minutes and Online appeared in the review; the workspace greeted Maya Web.
- Empty required controls were disabled. An incorrect preview code produced an error; 481629 continued. Back retained the display name. Online skipped city. Textareas and other web fields used native inputs with the protected phone hidden.
- Learner Google route retained age choice. Under 18 continued through guardian email → adult handoff → identity introduction → sample Persona → language preferences. French and English had separate A2/B1 steps and summary entries. Optional resource/days/time/notifications/widget choices, encouragement and benefits remained in their mobile order. The learner summary retained guardian Persona preview status and ended at the existing discovery handoff.
- Desktop views were inspected at the browser's normal width (1280–1506px during this session). At a measured 390 × 844 viewport, role and account screens had a 390px document/scroll width. The fixed action bar reached the viewport bottom, and both account actions fit within 24px side margins. The viewport override was reset.
- iPhone current-screen width remained 393px; Pixel width/scroll width remained 427px. Keyboard-aware fields opened the simulated keyboard; Continue/Verify dismissed it and advanced to the correct screen. Mobile checks used `flow-current` to avoid parked prior screens.
- No console warnings/errors appeared on the checked web teacher route. Authentication, verification, notifications and external services remain simulations.

Validation: 16 onboarding tests, 8 teacher model/calendar tests, TypeScript/production build, all 28 protected runtime hashes and whitespace checks passed.

Captures:

- `uxcel-role-desktop.jpg`: centered choice form and desktop action bar.
- `uxcel-role-390.jpg`: narrow browser layout.
- `teacher-name.jpg`: native desktop name form.
- `teacher-review.jpg`: public profile review in the final Uxcel format.

No deployment, real sign-in, identity submission, device hardware keyboard test or usability study was performed. Media upload behavior is shared with mobile and was not re-audited in this change.
