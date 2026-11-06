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
