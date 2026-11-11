# Split availability hours and final annotations

11 November 2026. The user explicitly requested multiple time slots per day, copying hours to other days like Cal.com, and production deployment. Subsequent annotations requested sidebar alignment/placement, visible role-label removal, Drafts and preview spacing.

## Reference inspection

Mobbin returned Cal.com web Availability screens; every returned image was inspected. No usage notice or access failure was returned.

- [Copy-times checklist with split Monday hours](https://mobbin.com/screens/e8849464-cef1-48dd-81d2-e71a6e558d67): COPY TIMES TO, Select all, source Monday checked/muted, day checkboxes and Cancel/Apply. Monday has 08:00–13:00 and 17:00–20:00.
- [Unselected checklist](https://mobbin.com/screens/6e701606-98b1-46ee-a1b1-72c1a257b108): no destination selected, showing the empty selection state.
- [Copied split-hours result](https://mobbin.com/screens/540c3f6a-48fe-4df4-872a-9ac422d31e1b): Thursday and Friday match the two source intervals.

The replacement behavior is an inference from the before/after images, not an executed interaction in Cal.com. Mimo explicitly tells teachers selected days will be replaced and enabled, names the action Copy hours, and excludes the source from destinations. The request is implemented in the current minimal Geist style with installed shadcn/Radix primitives.

## Behavior

Each typed WorkingDay owns enabled and a slot array with stable IDs. New intervals start blank and focus their start field. A day retains at least one interval and turning it off retains all values. Enabled intervals require valid times, end after start, and no overlap; adjacent intervals are allowed. Validation sorts a temporary view rather than reordering the controls. Copying requires a valid enabled source, explicitly selected target days and confirmation in the picker. Targets are replaced/enabled with fresh independent slot IDs. Source and other weekdays remain unchanged. Cancel/Escape and checklist selection do not alter saved state; Copy creates an unsaved draft and Save availability remains explicit.

Desktop Popover confines the target list to the available height while keeping header/footer visible. True-phone UI uses the existing protected BottomSheet, hides the keyboard, closes on an inactive FlowStack screen and restores focus. Narrow web retains visible time labels and usable hit areas. Paris-only saving, offline retry, no profile-price gate, confirmed bookings and in-memory scope remain.

## Final annotations

The account trigger is a canonical static Button, avoiding forced icon-only shadcn menu-button dimensions. Its explicit 40px geometry centers the 28px portrait or initials inside the 64px rail. Desktop Collapse/Expand lives first in the content header before breadcrumbs; narrow-web Open navigation and drawer Close navigation retain focus return. Visible account-role subtitles are removed from triggers and menus. Accessible menu names remain precise.

Only the Lesson library tab displays Drafts; its internal Module editor filter value and actual editor heading/breadcrumb are preserved. The annotated legacy Student preview action row and personalization card have a scoped 24px separation.

A later annotation requested keeping the Ongoing modules view switcher in place during scrolling. The original top:0 sticky rule resolved inside the padded content scrollport in native WebKit, leaving a 40px gap with rows passing above the bar. The web route now owns its initial top inset inside a page wrapper, while its scrollport has no top padding; the sticky bar can align directly below the separate workspace toolbar. Initial responsive insets and true-phone scrolling are preserved. Follow-up verification and production records distinguish this later release from the first promotion.

## Native review

Native in-app WebKit entered Monday 09:00–12:00 and 14:00–17:00, copied both ranges to Tuesday and Wednesday, and saved. All source/target values remained visible and correct. Final native checks measured the teacher avatar center at exactly 32px in the 64px rail, saw the header collapse control and Drafts label, and measured the preview gap at 24px. Supporting captures and automated test results are alongside this file. The existing user browser tab was preserved; final annotation review used a separate background tab.

## Boundaries

No persistent/backend availability, calendar synchronization, date exceptions, additional supported zones, protected runtime changes, original research/marketing changes or unrelated deployment project changes. Hosted deployment readiness and alias checks are recorded separately; hosted UI is not claimed as tested. No Git commit or push.
