# Learner usability revision · 11 November 2026

Implemented locally at the user's request, using the supplied [change requests](change-requests.md) and [Mimo Students Figma reference](https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=9-2). Source documents are reference material. No Figma edit, deployment, commit or push was performed.

## Feedback coverage

| Request | Implemented behavior | Evidence |
| --- | --- | --- |
| ONB-1 | Confidence question names the selected language(s). | Desktop/phone onboarding browser flows. |
| ONB-2 | Optional challenge presets and free text; text-only, preset-only, combined and skipped states are valid. Answers survive Back and appear in summary/profile. | Unit cases plus text-only browser flow and simulated keyboard dismissal. |
| ONB-3 | Multiple toggleable goals; at least one required. All values retained; custom details optional. | Unit cases and desktop/phone selection/deselection, zero-selection and text-only rejection. |
| ONB-4 | Online and In person are independent; city appears for In person. Shared search accepts both as OR preferences; booking keeps both choices supported. Teacher format remains separate. | Onboarding/model tests and full learner handoff. |
| ONB-5 | Learner completion opens chosen-teacher discovery directly. No matching question, automatic matching or matching-only screens. | Route/source review; browser checks confirm no Find a match. |
| SRCH-1 | Every teacher card has calculated average/count; unrated teachers show New / No reviews yet. | Full-list model assertions and rendered search. |
| SRCH-2 | Visible rating-descending and price-ascending sort; existing filters retained. | Browser sort order and filter preservation checks. |
| SRCH-3 | Today / Tomorrow filters require open slots; Soonest available sorts next slot. Dated clickable times appear on cards. | Europe/Paris/DST model tests; rendered day filters. |
| SRCH-4 | One Rating component links the full review list from search/profile/booking/lesson cards. Saved reviews update all summaries and sorting. | Shared component/source review; full-list browser navigation and saved-review flow. |
| TCH-1 | Send a message is a secondary action beside booking near the profile top. | Desktop viewport assertion; settled Pixel visual/geometry check. |
| BKG-1 | Format labels/selectors retained; format explanatory paragraphs omitted. | Shared BookPage source/render review. |
| BKG-2 | Checkout has no demo/test/placeholder copy, and no sensitive card entry. | Desktop/phone payment text assertion. |
| BKG-3 | Exclusive Web Lock + live storage recheck precedes booking receipt. Success goes directly to Upcoming. Conflicts/save failures report no payment. | Actual two-tab stale checkout test; model concurrency, idempotency, malformed/failed storage tests. |
| LSN-1 | Every mobile learner route has Home / Lessons / Search / Profile in the same footer. Lessons detail/review/cancel retain the Lessons active state. | Phone browser navigation assertions; shared FlowScreen factory. |
| LSN-2 | Start-inclusive/end-exclusive Ongoing, future Upcoming, ended Past; cancelled records excluded. Own empty states and suitable actions. | Exact-boundary unit cases and desktop/phone tab/actions checks. |

## Verification completed

- 79 unit/worker tests: 24 onboarding, 30 teacher/editor, 11 learner, 5 routing, 5 locations and 4 worker tests.
- 9 browser tests: `usability-onboarding.spec.ts` (2), `usability-learner.spec.ts` (4), `device-routing.spec.ts` (3).
- Production TypeScript/Vite build and all 28 protected runtime integrity hashes.
- In-app visual checks: desktop search/home, iPhone search, Pixel search/profile. Measured phone content/client widths match at 393px and 427px on checked screens. Profile messaging action fits in the Pixel screen; Labil Grotesk is applied.
- Focused final layout regression passed after compacting mobile filters and correcting global button-style leakage. Captures: [desktop search](desktop-search.png), [phone search](mobile-search.png).

## Prototype limits

Teachers, reviews and lessons are fictional. Onboarding answers remain in the current page session. Learner bookings/reviews persist in `mimo.learner-bookings.v1` localStorage. Web Locks serialize reservations across tabs on that origin/browser profile; other browsers/devices have independent state. Browsers without Web Locks fail safely instead of claiming a reservation. No actual payment, messaging delivery, video call, backend account or cross-device availability service is connected. Teacher workspace requests/cancellation are preserved separate simulations.

Physical-device touch behavior, full assistive-technology review, all historical Figma screens and production integrations were not verified. The Figma Code Layer source links were exposed by the connector but could not be read through the available resource route; native screen design context and existing project components were used for the local implementation.
