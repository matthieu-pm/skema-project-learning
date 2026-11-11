# Availability and sidebar reference decisions

Date: 11 November 2026.

## Scope and job

A teacher chooses open weekdays, sets one shared daily range, and saves valid availability while existing bookings remain unchanged. Target: AvailabilityPage and, after the user's added request, the shared web WorkspaceSidebar on teacher and learner routes. The user selected implementation of the recommended direction. Onboarding remains reference suggestions only.

## Preserve list

- Mimo tutoring domain, monochrome Geist styling, existing shadcn primitives, Hugeicons, existing routes/data and installed dependencies.
- Exactly one shared start/end range across all selected days; no independent per-day ranges, extra schedules, overrides, copying, calendar integration or new persistence.
- Seven selectable weekdays; Europe/Paris-only saving; original validation; offline retry with retained values; no lesson-price/profile gate; confirmed bookings untouched.
- Sidebar routes, primary actions, support links, account items, one exact active route, 248px/64px widths, keyboard menus/tooltips, narrow-web dismissal/focus return and true-phone navigation.
- User explicitly requested removal of the visible app name from the sidebar. The old brand home link is removed with the wordmark; existing Students/Home navigation remains.

## Direction and moves

Take the row-based weekly editor and separate time-zone column shown by Cal.com and Calendly. Mimo retains one shared range rather than pretending to support the references' independent daily intervals. The global range controls and their explanatory label are a Mimo-specific adaptation. Use Cal.com's account-led compact sidebar structure, with Mimo's actual routes/actions and existing account menu.

1. Weekly schedule: full weekday rows with on/off states and the selected shared hours; time zone and booking note in a distinct aside, one Save action and saved/dirty state at the heading. Cal.com shows the day rows, side time zone and heading Save. Calendly also shows a weekly list with time zone distinguished from day values. Booking-note placement and shared-range copy are local judgment, not claimed reference behavior.
2. Account-led sidebar: put the actual account menu at the top, remove the wordmark/workspace brand block, use denser flat rows and keep support at the bottom. Cal.com is the example for this structure. Preserve both learner and teacher destinations; no reference routes/data were copied.

## Anchors

- [Cal.com Business Hours](https://mobbin.com/screens/ebe6e03c-2a8c-44ff-ad66-ef3f6e5ecc04?utm_source=chatgpt&utm_medium=ai-assistant&utm_source_platform=mcp): weekly rows, separate timezone, header Save, account-led sidebar. Take structure; leave Cal.com branding, sample data, calendar integrations, independent daily intervals, overrides and extra schedule features. Image inspected: https://mobbin.com/api/mcp/short/o5PbFyuf .
- [Calendly Availability](https://mobbin.com/screens/1c453c90-1838-4346-a917-b4387eebe6be?utm_source=chatgpt&utm_medium=ai-assistant&utm_source_platform=mcp): weekly rows with adjacent hours, timezone below the list, secondary date-specific area. Take the row grouping only; leave brand colors, independent hours, copy and date overrides. Image inspected: https://mobbin.com/api/mcp/short/nM2i1mxe .

## Other inspected results

- Cal.com schedule overview: https://mobbin.com/screens/f6cca3e6-58f4-4300-aeeb-d30eff5f46f2 . Pool for understanding the account-led shell; no extra schedule list added.
- Quo business hours: https://mobbin.com/screens/0d15f32b-748a-40ec-ad9f-33a48a10a670 . Different call-management domain; inspected, dropped because its business-hours controls and call flow are outside Mimo's job.
- Square Availability dialog: https://mobbin.com/screens/e3f95f95-8e70-4b7a-821f-b79eb1fcb3b0 . Inspected, dropped because a staff/day modal would hide the weekly overview.
- Klaviyo Office hours: https://mobbin.com/screens/88f2d4e7-270a-4d55-a1b0-df2cdba24a2d . Support domain; inspected, dropped because its weekday selectors introduce independent per-row ranges.
- The other Cal.com results were a video call and out-of-office dialog; inspected and dropped as different tasks.

## Search record

Searched weekly availability settings and Cal.com availability, web/standard, four screens each. All returned images were inspected. No missing-image, authorization or plan error and no ai_usage_notice. Task intent and output_destination code were consistent with onboarding research. No Mobbin collection or comments were created.

## Deferred

Independent per-day intervals, date exceptions and new calendar behavior need a separate functional request. Onboarding suggestions and exact flow references are in onboarding-references.md; no onboarding source changes were made.

## Comparison evidence

before.png is an actual capture from the preserved, previously verified source snapshot running on temporary local port 4189. after.png is the implemented current source on port 4183. Both are 1280x720, show matching Mon/Tue/Thu/Fri 09:00-17:00 data, and use browser-measured main/sidebar rectangles. The board uses the unmodified provided template with filled data and its supported 2x capture zoom. No UI was redrawn for the comparison.
