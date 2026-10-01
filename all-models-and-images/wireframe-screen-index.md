# Mobile tutoring app — wireframe index

[Open the editable tldraw board](https://www.tldraw.com/f/JCGxbET3aWyujI3qfG1Pe)

72 editable mobile screens, organised across 9 flow pages plus an overview. Open **00 · Read me & flow map** first. Every phone frame is 390 × 844; blue annotations identify onward routes. These are structural wireframes, not a working prototype.

## Product scope

One learner and one chosen teacher per session, online or in person. Practical outcomes, short modular lessons, teacher-controlled AI assistance, private feedback and optional practice. No social feed, forced matching, groups, leaderboards, long-form courses or daily obligations.

## Source and assumptions

Content is based on the supplied pasted teacher research, ideation, scope rules and interviews. Explicit scope rules take priority over conflicting early brainstorm ideas. Counts from the 8-person and 15-person summaries have not been pooled. No design-system file was supplied; neutral wireframe styling is used.

People, locations and commercial details are illustrative. €30 sessions, a 10% teacher fee, €0 booking fee and a 24-hour cancellation policy are placeholders for validation. Payments, identity verification, guardian access and recording/data-retention rules require further decisions. External provider/system screens are shown as handoffs, not custom app screens. Advanced AI speaking and first-pass writing feedback are optional extensions; the core flow remains usable without AI.

## Research → design

- Preparation workload → saved goal briefs, reusable templates and short lesson blocks (F3–F8).
- Creative control → editable drafts, AI review, preview and explicit sharing (F6–G2).
- Real human interaction → chosen teachers, live conversation and in-person sessions (B2–D5).
- Practical learning → a concrete outcome and real-world prompts (B5, D4, E1–E5).
- Reduced administration → booking, calendar connections, reminders and approved recaps (C1–C8, G3–G4, G7).
- Feedback and accountability → private learner reflection, teacher observations and safety reporting (D6–D8, E8, G6).

## 01 · Start & setup

Choose a role → sign in → set goals or create a teacher profile.

### A1 · Welcome

**Learn with a person** — Practical language lessons, made for you.

- Primary action: Continue.
- Routes: Learn → A2 → A4 · Teach → A2 → A7
- Behaviour: Role can be switched later. No automatic matching.

### A2 · Sign in / create account

**Let’s get started** — We’ll email you a secure sign-in code.

- Primary action: Send code.
- Routes: Send code → A3 · Under 18 → I8
- Behaviour: Passwordless authentication; no separate reset screen.

### A3 · Verify email

**Check your email** — We sent a code to alex@example.com.

- Primary action: Verify and continue.
- Routes: New learner → A4 · New teacher → A7 Returning user → B1 / F1
- Behaviour: Inline state shown: invalid or expired code; resend is rate limited.

### A4 · Language & level

**What will you learn?** — You can change this with your teacher.

- Primary action: Continue.
- Routes: Continue → A5
- Behaviour: Use language names, not flags. Interface language is separate (H3).

### A5 · Learning goal

**What would help you?** — Pick a focus. A short answer is enough.

- Primary action: Save my goal.
- Routes: Save → A6 · Attachment → I3
- Behaviour: Goal brief is shared only with a chosen teacher.

### A6 · Lesson preferences

**How will you meet?** — Choose what feels comfortable.

- Primary action: Find teachers.
- Routes: Find teachers → B2 · Skip → B1
- Behaviour: Preference setup is optional; availability is chosen per booking.

### A7 · Teacher profile setup

**Introduce your teaching** — A short profile helps learners choose.

- Primary action: Continue to verification.
- Routes: Continue → A8 · Availability → G3
- Behaviour: Draft auto-saves. Preview the profile in B4 before publishing.

### A8 · Identity verification

**Verify your identity** — Build trust before accepting bookings.

- Primary action: Start verification.
- Routes: Submit → I4 · Approved → G3 → F1
- Behaviour: Provider, retention and eligibility rules are product decisions.

## 02 · Find & book

Learner flow · browse by fit → inspect a teacher → book one focused session.

### B1 · Learner home

**Hi, Alex** — Your next real-world conversation starts here.

- Primary action: View next session.
- Routes: Session → C3 · Practice → E1 · Progress → E8
- Behaviour: First-use home uses the empty state H5. No streak or daily obligation.

### B2 · Teacher discovery

**Find your teacher** — French · A2 · Paris

- Primary action: View Maya’s profile.
- Routes: Profile → B4 · Filters → B3 · No results → H5
- Behaviour: Learner chooses. Sorting by relevance has an explanation, not a forced match.

### B3 · Search filters

**Narrow your search** — Choose the things that matter to you.

- Primary action: Show teachers.
- Routes: Apply → B2 · No results → H5
- Behaviour: Distance applies only to in-person lessons. Show the complete price at checkout.

### B4 · Teacher profile

**Meet Maya** — French · A1–B2 · Identity checked

- Primary action: See lesson & availability.
- Routes: Lesson → B5 · Message → C7 · Report → D8
- Behaviour: All people and experience details are fictional examples; reviews stay private.

### B5 · Lesson preview

**At the café** — French A2 · Everyday life · 45 minutes

- Primary action: Personalise this session.
- Routes: Continue → B6 · Back → B4
- Behaviour: A short lesson outline, not a long-form course or locked learning path.

### B6 · Share session goal

**Make it yours** — Only Maya will see this brief.

- Primary action: Choose a time.
- Routes: Continue → B7 · Add material → I3
- Behaviour: Reuses onboarding information to reduce repeated writing.

### B7 · Select time & place

**Choose your session** — Maya · 45 minutes · €30

- Primary action: Review booking.
- Routes: Continue → B8 · Slot taken → H6
- Behaviour: Only available single-student slots appear. Online hides the location card.

### B8 · Booking checkout

**Review your booking** — Wed 30 Sep · 18:00–18:45 · Europe/Paris

- Primary action: Pay €30 and book.
- Routes: Success → C1 · Failed → H8 · Slot taken → H6
- Behaviour: Prices and policy are illustrative, not research findings.

## 03 · Manage & communicate

Confirmed booking → reminders → messages → change or cancel with clear consequences.

### C1 · Booking confirmed

**You’re booked** — Maya has your goals and session details.

- Primary action: View session.
- Routes: Session → C3 · Reminders → H3 · Calendar → G4
- Behaviour: Confirmation, reminder and receipt are generated automatically.

### C2 · Sessions list

**Your sessions** — Keep your learning in one place.

- Primary action: Open next session.
- Routes: Upcoming → C3 · Past → D6 · Book → B2
- Behaviour: Cancelled sessions remain in history with status and refund details.

### C3 · Session details

**At the café** — Confirmed · Wed 30 Sep · 18:00–18:45

- Primary action: Open session space.
- Routes: In person → D3 · Online → D1 Change → C4 / C5 · Message → C7
- Behaviour: Primary action changes with session time. Early entry opens preparation.

### C4 · Reschedule

**Choose another time** — Current: Wed 30 Sep · 18:00

- Primary action: Confirm new time.
- Routes: Confirmed → C3 · Conflict → H6
- Behaviour: Both people receive the updated time. New slot must be rechecked atomically.

### C5 · Cancel session

**Cancel this session?** — Maya · Wed 30 Sep · 18:00

- Primary action: Confirm cancellation.
- Routes: Cancel → C2 (cancelled) · Reschedule → C4
- Behaviour: Show actual amount before confirmation. Late-cancel variant explains any charge.

### C6 · Inbox

**Messages** — Conversations about your lessons.

- Primary action: Open conversation.
- Routes: Conversation → C7 · New message from profile → B4
- Behaviour: Same view for teachers. No public feed, groups, or follow system.

### C7 · Lesson conversation

**Maya** — At the café · Wed 30 Sep · View session

- Primary action: Send message.
- Routes: Session → C3 · Attachment → I3 Profile menu → D8 (report / block)
- Behaviour: A failed send stays as an editable draft with Retry. Private lesson communication.

### C8 · Notifications

**Updates** — Only the things that help your lessons.

- Primary action: View next session.
- Routes: Session → C3 · Summary → D6 Practice → E1 · Preferences → H3
- Behaviour: No pressure messages, competitive scores, or required daily actions.

## 04 · Meet & reflect

Human-led sessions · shared activities · teacher-approved summaries · private feedback.

### D1 · Online lobby

**Ready to meet Maya?** — At the café · Starts at 18:00

- Primary action: Join session.
- Routes: Join → D2 · Device permission → I5 Connection failure → H7
- Behaviour: Declining transcription never blocks the lesson. Consent is per session and revocable.

### D2 · Live video session

**At the café** — Maya + Alex · 12:34 elapsed

- Primary action: End session.
- Routes: Activity → D4 · Notes → D5 · Chat → C7 End confirmation → G7 (teacher) / D6 (learner)
- Behaviour: End requires confirmation. Lost connection preserves notes and opens H7.

### D3 · In-person session

**You’re here to talk** — Maya + Alex · At the café

- Primary action: Start session.
- Routes: Start → D4 · Notes → D5 · No-show → I1 Finish → G7 / D6
- Behaviour: Minimal screen use supports real conversation. No location tracking or forced check-in.

### D4 · Shared activity

**Order in your own words** — Activity 3 of 4 · Café role-play

- Primary action: Next activity.
- Routes: Next → next block / D5 · Teacher edit → F7
- Behaviour: Supports open responses, quick quizzes, listening, and offline physical tasks.

### D5 · Shared lesson notes

**Keep what helped** — Visible to you and Maya · Auto-saved

- Primary action: Save and return.
- Routes: Return → D2 / D3 · Teacher recap → G7
- Behaviour: Visibility is explicit for every note. Manual notes work without AI or recording.

### D6 · Learner recap

**Here’s what you worked on** — Reviewed by Maya · Wed 30 Sep

- Primary action: Leave private feedback.
- Routes: Feedback → D7 · Practice → E1 Rebook → B7 · Awaiting recap → “Maya is reviewing”
- Behaviour: Learners see only the teacher-approved version; no fabricated automatic grade.

### D7 · Private lesson review

**How did it feel?** — A short check-in after your lesson.

- Primary action: Send feedback.
- Routes: Send → E8 (thank-you state) · Report → D8
- Behaviour: Optional, skippable, and separate from safety reporting. No public leaderboard.

### D8 · Report / block

**Tell us what happened** — Your report goes privately to support.

- Primary action: Submit report.
- Routes: Submit → confirmation + case reference Booking help → C3 · Attachment → I3
- Behaviour: Immediate danger: show local emergency guidance. No promise of instant investigation.

## 05 · Practice & progress

Teacher-assigned practice first. Advanced AI speaking and writing are optional extensions.

### E1 · Practice hub

**Keep the conversation going** — Practice when it works for you.

- Primary action: Start speaking practice.
- Routes: Speak → E3 · Material → E2 · Write → E5 Optional AI → E4 · Progress → E8
- Behaviour: No streaks, daily quota, locked progression, or compulsory AI.

### E2 · Resource detail

**A café conversation** — French · A2 · Listening · Chosen by Maya

- Primary action: Practise with this.
- Routes: Practice → E3 · Back → E1
- Behaviour: Filter library by language, level, format and topic; preserve original attribution.

### E3 · Speaking recorder

**What would you order?** — Speak for about 30 seconds. No timer pressure.

- Primary action: Record my response.
- Routes: Permission → I5 · Preview → Send → E6 AI off → feedback from teacher only
- Behaviour: After recording: waveform, Play, Re-record, Delete, and Send replace the record CTA.

### E4 · Optional AI role-play

**Practise at the café** — AI practice partner · Not your teacher

- Primary action: Send reply.
- Routes: Finish → E6 (AI-labelled feedback) Return → E1 · AI unavailable → I2
- Behaviour: Optional advanced feature; teacher-approved topic. No automatic sharing of transcripts.

### E5 · Writing submission

**A short café review** — From Maya · 60–100 words suggested

- Primary action: Send to Maya.
- Routes: Submit → E6 (awaiting review) Attachment → I3 · Teacher review → G5
- Behaviour: AI essay evaluation is optional and never presented as a final teacher grade.

### E6 · Practice feedback

**Your feedback** — Reviewed by Maya · Speaking practice

- Primary action: Try again.
- Routes: Retry → E3 · Ask → C7 · Done → E8
- Behaviour: Pending version says “Sent to Maya”. AI version is labelled “AI suggestion — not reviewed”.

### E7 · Saved materials

**Your materials** — Lesson resources, all in one place.

- Primary action: Open café menu.
- Routes: Open → E2 · Upload → I3 · Offline → H7
- Behaviour: Library can filter by level and language. Downloaded resources remain available offline.

### E8 · Personal progress

**See what’s changing** — French · A2 · Your own learning journey

- Primary action: Book your next session.
- Routes: Rebook → B7 · Goals → A5 · History → C2
- Behaviour: Progress is based on teacher observations and your reflection, not an inferred CEFR promotion.

## 06 · Teacher workspace

Student goals → reusable short lessons → editable blocks → reviewed AI assistance.

### F1 · Teacher today

**Hi, Maya** — A little preparation. More time teaching.

- Primary action: Prepare Alex’s lesson.
- Routes: Prepare → F3 / F6 · Review → G5 Session → C3 · Inbox → C6
- Behaviour: Teacher bottom navigation: Today / Students / Lessons / Profile.

### F2 · Students

**Your learners** — Only people you teach or who contact you.

- Primary action: Open Alex’s profile.
- Routes: Learner → F3 · Invite → share sheet
- Behaviour: No automatic student assignment. Invitations require the learner to accept.

### F3 · Learner detail

**Alex’s learning** — French A2 · Everyday conversation

- Primary action: Prepare a short lesson.
- Routes: Create → F5 · Review → G5 · Message → C7
- Behaviour: Notes distinguish observable progress from assumptions about the learner.

### F4 · Lesson library

**Your lessons** — Reuse what works. Adapt what needs to change.

- Primary action: Create a lesson.
- Routes: New → F5 · Open → F6 · Duplicate → new draft F6
- Behaviour: Published and draft versions are distinguished; duplicate before changing a reusable template.

### F5 · New lesson brief

**One session, one outcome** — Start with a template, AI help, or your own ideas.

- Primary action: Create editable lesson.
- Routes: Template / blank → F6 · AI draft → F8
- Behaviour: Goals are prefilled. No long-form course authoring or mandatory essay-length brief.

### F6 · Modular lesson editor

**At the café** — Draft saved · French A2 · 45 / 45 minutes

- Primary action: Preview lesson.
- Routes: Block → F7 · Preview → G1 Add → block type picker · AI help → F8
- Behaviour: Drag or use Move up/down. Delete has Undo. Changes stay draft until shared.

### F7 · Block editor

**Edit café role-play** — Speaking block · Changes save to your draft

- Primary action: Save block.
- Routes: Save → F6 · AI → F8 · Add resource → I3
- Behaviour: Block picker offers speaking, quiz, listening, text, writing, and movement prompts.

### F8 · Review AI draft

**Keep your own approach** — AI suggestion · Not yet added to your lesson

- Primary action: Use reviewed suggestion.
- Routes: Use → F6 / F7 · Discard → unchanged draft AI unavailable → I2
- Behaviour: Optional preparation aid. Never publishes or overwrites a lesson without teacher action.

## 07 · Teach & manage

Preview and share → manage availability → assess work → approve the recap → see earnings.

### G1 · Learner-view preview

**Preview as Alex** — Only you can see this draft preview.

- Primary action: Share with Alex.
- Routes: Share → G2 · Edit → F6
- Behaviour: Preview catches instruction clarity, timing and accidental private-note exposure.

### G2 · Share lesson

**Ready for Alex** — At the café · Version 2

- Primary action: Share lesson.
- Routes: Shared confirmation → F1 · Student sees → B5 / C3
- Behaviour: Preserve the version used in past lessons. No group publishing flow.

### G3 · Teacher availability

**When can you teach?** — Europe/Paris · Change time zone

- Primary action: Save availability.
- Routes: Calendar → G4 · Save → F1
- Behaviour: All slots support exactly one learner. Existing bookings survive changes to availability.

### G4 · Calendar connections

**Keep calendars in sync** — Check conflicts before someone books.

- Primary action: Connect Google Calendar.
- Routes: Provider permission → connected state Return → G3 · Sync expired → Reconnect
- Behaviour: External permission screen is provider-owned. Offline .ics export is a fallback, not two-way sync.

### G5 · Review submissions

**Work to review** — Feedback that helps the next conversation.

- Primary action: Review Alex’s recording.
- Routes: Open → G6 · Learner → F3
- Behaviour: Teacher can review without AI. Pending work has a clear status and no artificial score.

### G6 · Teacher evaluation

**Feedback for Alex** — Café speaking practice · 0:32

- Primary action: Share reviewed feedback.
- Routes: Share → E6 · Next submission → G5
- Behaviour: AI panel is absent when consent is off. Writing variant shows original essay and annotations.

### G7 · Approve session recap

**Finish with a useful recap** — Draft · Alex · At the café

- Primary action: Approve and share recap.
- Routes: Share → learner D6 · Teacher → F1 AI unavailable → I2 · Private lesson reflection → F3
- Behaviour: Manual recap is always available. Learner sees “Awaiting teacher recap” until approved.

### G8 · Teacher earnings

**Your earnings** — Clear payment details for each session.

- Primary action: View payout details.
- Routes: Payout setup → I7 · Receipt → transaction detail
- Behaviour: Paid-session model, 10% sample fee and payout timing require business validation.

## 08 · Account & recovery

Shared settings plus first-use, booking conflict, offline, and payment recovery screens.

### H1 · Account hub

**Your profile** — Alex · Learner

- Primary action: Edit my profile.
- Routes: Details → H2 · Preferences → H3 Privacy → H4 · Teacher role → A7
- Behaviour: Teacher version exposes public profile, availability, earnings, and learner role switch.

### H2 · Edit profile

**Your details** — Choose what people see about you.

- Primary action: Save changes.
- Routes: Save → H1 · Email change → A3
- Behaviour: Public display name is distinct from legal verification data. Teacher public preview → B4.

### H3 · Preferences

**Make it work for you** — Change these whenever you need.

- Primary action: Save preferences.
- Routes: Calendar → G4 · Push permission → I5 · Save → H1
- Behaviour: System notification permission and in-app preferences are separate. No promotional opt-in by default.

### H4 · Privacy & safety

**Your choices** — You stay in control of your information.

- Primary action: Save privacy choices.
- Routes: Recordings → E7 · Reports → D8 Delete → confirmation dialog · Export → request receipt
- Behaviour: Account deletion explains active bookings, retained transaction records, and reversibility.

### H5 · Empty states

**A good place to start** — Your first lesson can be about one small goal.

- Primary action: Explore teachers.
- Routes: First use → B2 · No results → B3 Empty teacher library → F5
- Behaviour: Same shell adapts to empty inbox, library and review queue with a relevant next action.

### H6 · Slot unavailable

**That time just filled up** — Your lesson goals are still saved.

- Primary action: Choose another time.
- Routes: New time → B7 / C4 · Payment pending → H8
- Behaviour: Never imply payment failed if status is unknown; resolve the original attempt before retrying.

### H7 · Offline / reconnecting

**Connection interrupted** — Your saved notes and drafts are still here.

- Primary action: Try reconnecting.
- Routes: Recovered → previous screen · Files → E7 Session trouble → I1 / C7
- Behaviour: Sending and checkout are disabled offline. Do not show unsent work as shared.

### H8 · Payment recovery

**Payment didn’t go through** — Your session has not been booked.

- Primary action: Change payment method.
- Routes: New method → B8 · Success → C1 Unknown status → “Checking payment” (disable retry)
- Behaviour: Pending status offers status refresh and support, not a second charge. Show duplicate-charge protection.

## 09 · Exceptions & trust

Supporting states · protect saved work, preserve choice, and make next steps clear.

### I1 · No-show / session issue

**Still waiting for Maya?** — Your session started 10 minutes ago.

- Primary action: Report a missed session.
- Routes: Message → C7 · Report → confirmation + case ID Reschedule → C4
- Behaviour: Teacher variant: “Still waiting for Alex?” No automatic blame or refund promise.

### I2 · AI unavailable / draft failure

**Keep going with your ideas** — We couldn’t create an AI suggestion.

- Primary action: Continue editing.
- Routes: Manual → F6 / F7 / G7 · Retry → F8
- Behaviour: Learner variant returns to teacher-provided practice. Slow generation has Cancel and saved draft.

### I3 · Add material

**Bring something useful** — Attach it to Alex’s café session.

- Primary action: Attach to session.
- Routes: Uploaded → originating brief / chat / lesson Failure → Retry · Remove → confirm
- Behaviour: CTA enabled after upload. Show supported types, size limit, processing and meaningful errors.

### I4 · Verification status

**Your profile is under review** — You can prepare lessons while you wait.

- Primary action: Go to your workspace.
- Routes: Workspace → F1 · Approved → publish profile Needs changes → A8 with specific retry reason
- Behaviour: Rejected or unreadable document variant offers retry and support without losing the profile draft.

### I5 · Permission explanation

**Use your microphone?** — So Maya can hear your speaking practice.

- Primary action: Allow microphone.
- Routes: System prompt → E3 / D1 Denied → typing fallback / device settings
- Behaviour: Camera, notifications and location use purpose-specific variants. Request only at point of need.

### I6 · Delete account confirmation

**Before you leave** — Review your bookings and saved work.

- Primary action: Delete account.
- Routes: Resolve booking → C3 · Delete → final confirmation Success → A1
- Behaviour: Deletion is disabled while unresolved bookings remain; exact retention period must be specified.

### I7 · Payout setup

**Where should payouts go?** — Teacher account · Secure payment provider

- Primary action: Continue to secure setup.
- Routes: Provider returns → G8 (connected) Failure / pending → status + retry
- Behaviour: Illustrative paid model. Provider-owned financial form is not duplicated in the app.

### I8 · Guardian-managed learner

**Learning with a guardian** — A guardian needs to set up a younger learner.

- Primary action: Invite my guardian.
- Routes: Invitation → waiting state · Guardian accepts → A3 Guardian sets learner goals → A4
- Behaviour: Proposed safeguarding flow for mixed-age research; age eligibility and consent rules need validation.

## Review notes

The screen set includes representative default, empty, pending, error, permission and confirmation states. Repeated modal variants and operating-system/provider forms are specified in annotations rather than duplicated. This is a design proposal, not evidence of validated usability or an implemented product.

