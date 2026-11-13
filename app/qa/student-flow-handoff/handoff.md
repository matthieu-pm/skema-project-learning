# Mimo student flow — implementation handoff

**Status:** Design specification only. This document describes gaps found in the live student preview and how to close them.  
**Reviewed:** 12 November 2026, iPhone preview, sample learner account.  
**Live build:** [SKEMA Mimo](https://skema-project-learning.vercel.app/?view=mobile)  
**Design reference:** [Mimo student prototype](https://mimo-student-review.nansi-ux.chatgpt.site) and the current `mimo-student-prototype/` source in this workspace.

## Audit coverage

| Step | Observed in the live build | Assessment |
|---|---|---|
| 1. Welcome and learner setup | iPhone frame, Luma welcome, learner role, sample sign-in, language and level, speaking confidence, optional challenge text, multiple goals and formats, optional verification | Core requirements present. The final **Find a teacher** button lands on Home, adding another tap. |
| 2. Search and reviews | Language and format filters, Today/Tomorrow, rating/price/soonest sort options, prices, tappable review counts and direct slot selection | Main controls present. Budget cap and review excerpts are missing from results. |
| 3. Teacher profile and messaging | Book a lesson, prominent Send a message, curriculum preview, review excerpts, and slot list | Main entry points present. Message composer opened. Message delivery was outside the review. |
| 4. Booking, payment and rescheduling | Slot tap kept date, time and format. French search led to Italian conversation. Sample payment confirmed immediately and added a booking to Upcoming. Reschedule opened a separate review and succeeded | Language context is the main blocker. Successful confirmation is already implemented. |
| 5. Lessons and preparation | Ongoing, Upcoming and Past tabs, persistent footer, preparation modules, vocabulary Submit → Reveal, simulated join/leave, post-lesson star review form | Structure and preparation are present. Ongoing shows a session in progress. Past details show preparation copy, with no visible recap entry. |
| 6. Profile and calendar | Learner preferences summary, replay onboarding and prototype information | Profile has no visible calendar, direct edit or support entry. |

## Implementation gaps

### P0 · Carry the learner's language from search through booking

**Repro:** Select French in search, open Sofia Rossi (Italian and French), and tap an available online time. The date, time and format are selected, but the booking title is **Italian conversation**. Checkout shows teacher and time without making the selected lesson language explicit. [Search](output/student-flow-audit/12-search.png) · [Selected slot](output/student-flow-audit/29-slot-context.png) · [Payment](output/student-flow-audit/17-payment.png)

**Target:** Store the selected teacher, lesson or language, slot, timezone, format, duration and price as one booking draft. Resolve French when French is the active filter and the teacher offers it. If a teacher has several eligible lesson languages and the learner has not selected one, provide a labelled language or lesson choice before payment. When a teacher teaches French but does not offer the chosen slot for French, show that constraint and offer eligible slots. Render the same selection in checkout, confirmation, lesson details and rescheduling.

**Acceptance:** French → Sofia → a French-eligible online slot shows French all the way through Upcoming. The booking keeps the chosen date, time and format. Going back or rescheduling retains the language. The learner never silently books another language.

### P1 · Send learners directly to search after onboarding

**Repro:** The setup summary promises teacher discovery, but **Find a teacher** opens Home, where another button or the Search tab is required. [Setup summary](output/student-flow-audit/10-setup-summary.png) · [Home](output/student-flow-audit/11-home.png)

**Target:** Open Search directly with the learner’s chosen language and format preferences applied. Let the learner see and remove these filters. Preserve the existing multiple goal and format selections, and optional speaking challenge text.

**Acceptance:** One tap takes the learner from setup summary to teacher results. The filter controls reflect the choices made during setup. Home remains accessible from the footer.

### P1 · Restore the learner’s calendar and profile actions

**Observed:** Profile shows the collected preferences and Replay onboarding. It has no calendar, edit or support action. [Profile](output/student-flow-audit/27-profile.png)

**Target:** Add a clear **Your calendar** entry from Profile and a shortcut from lesson details. Provide day, week and month views using the same booking records as Lessons. Show date, local time or timezone, format and status. Selecting a lesson opens its details and existing management actions. Add direct actions to edit the learner’s name/contact and learning preferences, plus a support entry with local preview confirmation if support remains simulated.

**Acceptance:** The sample booking appears in Upcoming and the calendar. A confirmed reschedule moves the same booking, and cancellation removes it from the upcoming schedule. Editing goals or level saves the changes without replaying all onboarding.

### P1 · Separate unfinished learning, live sessions and completed lessons

**Observed:** Ongoing lists the current appointment and Join lesson. Preparation already exposes six modules and nine blocks for Gilbert, including Submit → Reveal. Past details for Emma still show **Before your session** and **Ask about preparation**, with no visible recap link. Joining and leaving Gilbert’s preview room returns to the same Ongoing session. [Ongoing](output/student-flow-audit/19-ongoing.png) · [Preparation](output/student-flow-audit/21-curriculum.png) · [Room](output/student-flow-audit/28-room.png) · [Past details](output/student-flow-audit/25-past-detail.png)

**Target:** Keep the existing Ongoing, Upcoming and Past tabs and consistent footer. Under Ongoing, provide **Continue learning** for unfinished course materials as well as **Join/Resume lesson** for the current appointment. Distinguish course progress from appointment status so an unfinished course stays reachable after a session ends. Before joining, show the online room or in-person meeting details appropriate to the booking. In the simulated room, provide a clearly labelled way to complete the session and open the recap. Give completed lessons **View recap** with the lesson’s key material and saved progress, along with review and rebook. If no recap exists, show a short state that explains that. Replace preparation prompts on completed sessions with recap copy.

**Acceptance:** Completing a simulated session moves the appointment to Past and opens its recap. Returning to the curriculum resumes unfinished work. Reviews remain available and stay associated with the correct session. Leaving the room alone does not mark attendance complete.

### P2 · Make teacher comparisons easier

**Observed:** Results already show rating counts, price, dates, selectable times and sort controls. Written review excerpts are visible on the profile, but absent from the results cards. The results have price sorting but no maximum-price filter. [Search](output/student-flow-audit/12-search.png) · [Teacher profile](output/student-flow-audit/14-teacher.png)

**Target:** Add one short review excerpt beside each card’s rating and a **Maximum price** filter that works with language, format and date. Reuse the existing full reviews entry. Keep the applied filters and sort when the learner goes back from a profile or review. Display lesson price with duration and label the timezone used for Today, Tomorrow and time sorting.

**Acceptance:** The learner can cap the cost of a lesson, sort the remaining teachers by price, rating or time, and open reviews. Returning to search restores the prior comparison. Zero matches offer a clear way to relax filters.

### P2 · Clarify checkout and reschedule outcomes

**Observed:** Immediate sample confirmation works. In the iPhone view, the payment action is below the initial viewport. A successful reschedule reuses the **You’re booked!** heading and first-booking actions. [Payment](output/student-flow-audit/17-payment.png) · [Confirmation](output/student-flow-audit/30-confirmation.png) · [Reschedule review](output/student-flow-audit/31-reschedule.png)

**Target:** Keep a visible **Pay [amount] and book** action in a checkout footer that clears the tab bar and safe area. Include lesson language, teacher, date, timezone, duration, format and total in the review. Confirm automatically once a valid slot is secured and the sample payment succeeds. For rescheduling, show **Lesson rescheduled**, the new time, and a direct return to lesson details. Keep the original booking until the replacement is secured.

**Acceptance:** One successful payment produces one booking under Upcoming. A failed, pending or unavailable-slot state leaves a clear retry or change-time route and preserves entered details. A successful reschedule updates the existing booking and clearly identifies the new time.

## Already implemented and worth keeping

- The iPhone preview and Mimo welcome screen, without the old reviewer panel.
- Speaking-confidence copy tied to the chosen language, optional challenge text, multiple goals, both lesson formats and learner-led teacher selection.
- Teacher reviews across search, teacher profile, messaging and lesson surfaces, plus the prominent Send a message action.
- Availability choices, the three sort options and clickable search slots.
- Automatic successful booking confirmation, reschedule review, lesson status tabs, preparation blocks and the persistent learner footer.

## Verify before handoff

1. Run the language-context regression using a multilingual teacher from both a profile CTA and a direct search slot.
2. Run success, duplicate-submit, slot conflict, payment failure/pending, and reschedule/cancel cases against the same booking record.
3. Check keyboard focus after page and tab changes, the names and selected states of single- versus multi-select controls, and reachability of inputs and actions above the fixed footer at 320 px and on iPhone. The challenge textarea and payment CTA require scrolling in the captured iPhone preview.
4. Check that reviews, drafts, preparation progress and recaps remain scoped to the correct teacher, booking and course after navigation.

The audit exercised the sample learner happy path, vocabulary answer reveal, simulated room entry/exit, and local booking/reschedule. It did not verify real identity, cross-device persistence, payment processing, message delivery, video, cancellations, payment failure/pending, all learning blocks, or full accessibility conformance. The live preview explicitly describes payments, messages and video as disconnected from services.
