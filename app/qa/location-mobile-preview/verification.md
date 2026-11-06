# Location entry and mobile preview — 6 November 2026

## Source and scope

Based on original repository main 7358d8e, not the earlier unmerged fork feature branch. Original PR #1 was already merged. Current contributor permission is READ: a new upstream PR is the review/delivery path. Protected mobile runtime files are unchanged.

## Checks

- Clean npm ci; production build; all 28 runtime file hashes pass.
- 64 tests pass: 30 teacher/editor, 20 onboarding, 5 routing, 4 Sites and 5 new location tests.
- New tests cover result formatting/deduplication, missing/malformed/no-result data, encoded and bounded place searches, coordinate rounding/validation, HTTP/network failures, cancellation propagation and recoverable permission/timeout messages.
- Live desktop Photon lookup for Paris returns distinct region/country choices. Arrow Down + Enter selects the expected location. A nonsense query displays no matches while retaining typed input.
- Live phone profile lookup for Luxembourg returns suggestions; selecting the location fills the field and dismisses the keyboard.
- iPhone and Pixel preview keep lesson navigation and Back visible. Activity content scrolls independently. Focused answer remains above the simulated keyboard; Submit answer → Reveal answer still reports the correct result. Advancing to matching pairs keeps module context and fixed controls.
- No real device coordinates were requested in QA. Permission-denied, timeout and service error paths were checked through deterministic helper tests; actual browser permission acceptance/reverse GPS lookup and physical devices were not exercised. No claims of a full accessibility audit.
- Photon public demo is a prototype service without an availability guarantee. UI includes attribution, location-use explanation and manual/retry recovery. No API keys or new paid services required.

Evidence: location-suggestions.jpg, location-no-results.jpg, phone-location-selected.jpg, iphone-preview.jpg, iphone-keyboard.jpg and pixel-preview.jpg.


Upstream delivery (6 November 2026): https://github.com/matthieu-pm/skema-project-learning/pull/2 is open from demichong:feat/location-and-mobile-preview. Latest original main 2e84226 (remove web toolbar avatar) was merged into the feature branch and preserved; the production build/runtime check passed after that integration. The contributor still has READ access to original, so no original-main push/merge was attempted.

Published review copy: Sites version 14, source da8df6904418983f6156511bd3647bb1e15197a7, saved version appgprj_6aec12084dfc8191add134139ef2dd4a~appgver_dd41f96c6f348191b63b6f6680c17f5a, deployment appgdep_6aedac5e4d148191b769706dff31690c succeeded. Same public URL/audience. Saved version 13 was superseded before deployment so the current review also preserves the latest original-main toolbar change. The original Vercel PR check requires owner authorization; this separate public review link remains available.
