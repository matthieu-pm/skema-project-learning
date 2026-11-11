# Minimal app redesign — 11 November 2026

Reference: user-supplied https://vercel.com/design.md. Applies to the app's onboarding, learner and teacher screens. Original marketing landing page and all protected runtime files remain unchanged.

Implemented locally: Geist 400/500/600 served from bundled fonts; monochrome surfaces; flat black actions; restrained borders/corners; quieter navigation; learner discovery and lesson rows; minimal onboarding forms; teacher dashboard, calendar, module authoring, results and profile surfaces. Existing generated fictional portraits are retained. Original companions remain in the asset library and the optional widget preview.

Validation:

- Production build passed after final code/CSS changes.
- 79 unit/worker tests and 17 existing browser tests passed (9 usability/routing plus 8 runtime).
- All 28 protected runtime hashes passed. Whitespace checks passed.
- Re-ran all four learner usability browser tests after final search/profile refinements; all passed.
- Rendered desktop learner search and teacher Students, Schedule, editor and results at 1440 × 1000. Checked content width and document overflow.
- Rendered learner search on iPhone and Pixel; manually checked teacher phone Students on both device presets and the responsive web editor in the in-app browser.
- Fixed a desktop media query that incorrectly restored two-column layout inside the phone teacher dashboard.
- Preserved the pre-existing modified screenshots in `../usability-feedback/` byte-for-byte. New captures are stored here.

The app remains a frontend prototype with fictional data and existing local save/share/payment/message/call boundaries. No deployment, Git commit or push was requested or performed. Physical devices, a comprehensive accessibility audit, dark mode and every possible state combination were not verified.
