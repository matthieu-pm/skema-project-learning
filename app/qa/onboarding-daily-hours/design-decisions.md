# Onboarding and independent weekday hours

11 November 2026. The user explicitly authorized implementing the suggested onboarding redesign, different working hours for each weekday, and production deployment of all pending app changes. Their follow-up invited another look at Cal.com on Mobbin.

## Onboarding

Implemented the compact Cal.com wizard direction previously researched at https://mobbin.com/flows/8400c4ca-9733-480c-b243-ba58806c88a6?tab=screens . Web uses a compact white form surface, segmented progress, nearby Back control, and full-width actions after the fields. Dense steps and the structured review use wider forms; long content uses normal document scrolling. The role-independent entry says Choose your path with two introduction segments until a role is selected, rather than claiming the unselected learner route's total. Selected-role and optional-identity progress retain the existing dynamic route count. Teacher setup remains eight steps. Learner, guardian, account recovery, free/unset lesson terms, review editing and optional identity routing remain supported.

Phone presentation uses the same app-owned form styling and segmented progress while retaining protected FlowStack, keyboard-aware controls, fixed action footer, safe areas and device chrome. No required step was removed or reordered; no account/identity provider or new service was introduced.

## Availability

Each weekday now owns its own enabled flag, start time and end time. Editing one day never changes another. Turning a day off retains its values for re-enabling. Save validates enabled days only, requires at least one enabled day, and reports missing, malformed, equal or reversed times against the affected weekday. Europe/Paris-only saving, offline retry with retained state, no profile-price gate and unchanged existing bookings are retained.

The typed factory creates fresh row state; updates copy only the changed day. The prior state was in memory, so no persisted schema migration is necessary. There is one interval per weekday. Split shifts, date overrides, calendar integration, backend availability and cross-device persistence were not added.

## Cal.com reference recheck

Mobbin search: Cal.com availability with different working hours each day, web, deep, three results. All images were inspected. No usage notice or access failure returned. The matched screens show aligned weekday switches and adjacent start/end controls, with timezone settings in a separate column.

- https://mobbin.com/screens/ebe6e03c-2a8c-44ff-ad66-ef3f6e5ecc04 : working-hours form with a time menu open. Returned image https://mobbin.com/api/mcp/short/0a9hJy3Y .
- https://mobbin.com/screens/adf8335b-a68e-41bb-a6f5-8a91af85e838 : the settled weekly form with independent day controls. Returned image https://mobbin.com/api/mcp/short/5khoIKqk .
- https://mobbin.com/screens/8a0d881c-dc4e-438d-a815-d9c37e6a11f1 : Monday 8am-1pm while other enabled weekdays retain 9am-5pm. Returned image https://mobbin.com/api/mcp/short/r1LFgbhd .

Mimo keeps its own labels, timezone restriction, sample profile, neutral Geist styling and existing sidebar routes. Cal.com's split-shift, copy-row, default-schedule, troubleshooting and date-override controls were not added. Desktop rows visually hide repeated full weekday field labels, keeping those exact accessible labels for assistive technology; narrow web and phone retain visible labels. The compact desktop rows fit the entire week in the checked 1280x720 viewport.

## Native evidence

Actual in-app browser checks traversed teacher email/code setup, profile editing, French/A2 selection, 45-minute/30-euro lesson terms, and the final 8-of-8 profile review. The new form composition and complete review are captured in onboarding-profile.png and onboarding-review.png. Earlier forms are retained in onboarding-before.png and profile-before.png.

A separate fresh teacher workspace verified Monday 10:00-17:00 and Tuesday 09:00-18:00 through real native time-field keyboard edits and Save. The values stayed independent and the page reported Saved. The resulting schedule and unbranded account-led sidebar are captured in availability-daily-hours.png. The sidebar includes all changes from the prior local-only revision and is part of the requested production release.

## Scope and limits

This remains the existing frontend prototype with its documented local data and service boundaries. Physical-device testing, exhaustive assistive-technology/zoom combinations and slowed frame-by-frame animation review were not performed. Automated verification and production metadata are recorded separately. No unrelated marketing, research assets, original Vercel project, independent Sites copy or protected runtime files were changed. No Git commit or push was requested.
