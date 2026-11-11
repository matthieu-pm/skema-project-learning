# App notice removal — 11 November 2026

Removed visible prototype/simulation notices and demo qualifiers across onboarding, learner and teacher app screens. This covers account/guardian/identity setup, dashboard, calendar, lesson authoring/player, student work/reviews/audio, sharing/status messages, settings, payout and help. Necessary actions have normal product labels. Lesson/profile/feedback preview actions remain functional.

Validation, storage error recovery, booking conflicts, disabled submitted answers, draft/shared snapshots and private-note exclusion are unchanged. The app still has the same local implementation and service limitations documented in context.md. Original research assets, marketing landing page and protected runtime source are unchanged.

Verification:

- Production build and TypeScript passed; all 28 runtime hashes passed.
- All 80 unit/worker tests passed. Updated the existing unsupported-browser assertion for the new recovery copy.
- All 28 distinct browser cases passed. The initial run passed 27/28: one routing test still selected the renamed “Try the mobile preview” link. Updated that selector to “Open mobile app”; all three routing cases passed on rerun. No product behavior fix was needed.
- The browser suite covers web/phone onboarding, desktop/phone booking, direct editing, native/custom dropdowns, dialog keyboard interaction and protected runtime gestures/keyboard behavior.
- Actual in-app browser visual checks covered onboarding, review results, learner profile, teacher account settings and Students. Rendered review/profile/dashboard text had no prototype, simulation, sample or fictional notices.
- A source scan found the remaining matching terms only in internal identifiers, CSS class names, fixture IDs and comments, not app UI notices. Functional preview controls remain.
- Existing dirty usability QA screenshots were backed up and restored byte-for-byte. Current automated captures are desktop-search.png and mobile-search.png in this folder.

Screenshots: onboarding.png, review.png, learner-profile.png, account-settings.png, dashboard.png.

Not verified: physical devices, assistive technology sessions and deployment. No Git publication or deployment occurred.
