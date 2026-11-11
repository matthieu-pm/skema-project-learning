# Sidebar and availability refinement · 11 November 2026

Scope: teacher/learner desktop sidebars and the shared teacher availability page. The user explicitly chose Cal.com and asked to omit the app name and profile/account type from the sidebar. Preserve Mimo's design tokens, typography, portraits, existing destinations, phone navigation, confirmed sessions, offline recovery and protected device runtime. Implement locally; no new deployment or Git delivery was requested.

## Mobbin references inspected

- [Cal.com account-first sidebar](https://mobbin.com/screens/7a0141e2-0283-47eb-9404-e02bef42601a): avatar/name at the top, direct primary links, nested destinations where appropriate and lower utility links. Mimo keeps its own content and purple selected-icon treatment.
- [Cal.com weekly hours editor](https://mobbin.com/screens/ebe6e03c-2a8c-44ff-ad66-ef3f6e5ecc04): independent weekday switches/ranges, time-zone field beside the week and a top Save action.
- [Cal.com copying hours](https://mobbin.com/screens/e8849464-cef1-48dd-81d2-e71a6e558d67): copy action with selected target days and explicit Apply. Mimo uses the protected phone BottomSheet for that action on phones.

These are user-selected examples from one product, not independent cross-product precedent or usability research. No reference assets or source code were vendored. No new dependency was added.

| Problem | Applied change | Reference |
| --- | --- | --- |
| The sidebar repeats the app and account type, and availability is nested under Schedule | Account portrait/name at top, direct Availability/Messages links, remaining destinations retained through primary, nested, utility and account controls; corresponding learner branding/subtitle removal | Account-first sidebar |
| A single start/end time applies to all selected teaching days | Independent day switches/time ranges, add/remove/copy actions, adjacent timezone and top Save; Mimo's validation and session-local draft behavior retained | Weekly editor and copy selection |

## Verification

- 83 unit/worker tests passed: 34 teacher/editor/availability, 24 onboarding, 11 learner, five routing, five location and four worker tests.
- All 22 production-browser tests passed. Six new tests cover teacher/learner account/sidebar routes, Payout access, Lessons subnavigation, collapsed sidebar, narrow-web drawer dismissal, independent hours, selected-day copy isolation, retaining drafts across routes, identical calendar sessions, invalid/overlapping hours, closed-week rejection, unsupported timezone, offline failure and iPhone/Pixel copy sheets without horizontal overflow.
- Production build and all 28 protected runtime hashes passed. Browser tests also reject uncaught page errors.
- In-app visual checks covered the desktop sidebar/availability page, copy popover and before/after comparison. Phone captures from the behavioral tests were visually inspected.
- Before/after panes are the same desktop crop; bounds.json contains measured DOM regions. board.html embeds both images for standalone viewing. comparison.jpg is the captured board. before.jpg comes from the currently deployed original UI; after.jpg is the applied local source.
- React review checked stable component identity, hook use, state isolation, immutable range copying, keyboard-aware time fields, label/error associations, existing Radix menu focus behavior and phone-specific sheet/keyboard handling.

Boundaries: availability remains in-memory for the current browser preview session. Saving does not synchronize a learner calendar or modify any confirmed booking. Only Europe/Paris is supported. Date overrides, multiple named schedules and integrations visible in Cal.com were not introduced. Physical-device testing and hosted verification of the new UI were not performed.

Local entry: `http://127.0.0.1:4175/?teacher=1&view=web&flow=availability`; change `view=mobile` for the protected phone preview. Existing port 4174 belongs to another worktree and was preserved. Prior inline-editor release notes/captures already in the working tree were preserved.

## Production release

The user subsequently authorized merge/deployment. [PR #5](https://github.com/matthieu-pm/skema-project-learning/pull/5) merged as `4a7c06a0ee601ff725443fe40bb2ce1cf3d0b2f6`; its tree equals tested head `3ce2d72`. Vercel deployment `dpl_DM9T3FpbFt5rZGFmWVcUFBnYPfKP` reached Ready after about 20 seconds of build time and owns the stable production domain.

Hosted browser checks confirmed teacher/learner sidebars without repeated app/profile-type labels, learner profile navigation, independent Monday/Tuesday start times, the desktop copy popover and the phone-scoped copy BottomSheet. The iPhone keyboard was dismissed and content/scroll widths both measured 393px. No browser warning/error logs appeared on the three checked pages. Temporary hour edits were restored without saving, and copy dialogs were cancelled. Captures: `production-desktop.jpg`, `production-iphone.jpg`. These notes/captures are local follow-up evidence. Physical devices and all other hosted states were not retested; the separate Sites copy was not updated.
