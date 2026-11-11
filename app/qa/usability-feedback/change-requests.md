# Usability Testing Feedback: Change Requests

## Context for the AI

This file lists change requests from a usability testing session. The feedback came from our professor, who watched learners use the app. The app connects **learners** with language **teachers**. Its main flows are onboarding, teacher search, teacher profiles, booking and payment, and lessons.

**Reference product:** For the search and booking experience, use [Doctolib](https://www.doctolib.fr/) as the pattern to follow: search results, filters, sorting, availability slots and instant booking.

### How to use this file

- Each change has an ID (e.g. `ONB-1`), the original feedback, the change to make, and acceptance criteria.
- Work through one section at a time. Before you edit anything, find the screens and components involved in the codebase.
- Keep each change scoped to what is written here. Don't redesign unrelated parts of the screen.
- Where the feedback leaves a decision open, it is listed under **Open questions**. Follow the stated default, or ask.
- Reuse the existing components, tokens and styles. A new UI element (text box, filter chip, sort control) should look like the rest of the app.

---

## 1. Onboarding

### ONB-1: Reword the Step 3 question "How do you feel?"
- **Feedback:** Learners don't know what they're being asked to reflect on.
- **Change:** Replace "How do you feel?" with a question that names the subject. For example: "How do you feel about speaking [language]?" or "How confident do you feel speaking [language]?"
- **Acceptance criteria:**
  - The Step 3 question states what the learner is rating (e.g. speaking confidence in the target language).
  - Any supporting text or answer labels still fit the new wording.

### ONB-2: Add a free-text box to "What makes speaking difficult?"
- **Feedback:** Learners want to describe their challenges in their own words.
- **Change:** Keep the existing options and add a text box (e.g. "Something else? Tell us in your own words").
- **Acceptance criteria:**
  - A text box appears on this step, with a clear label or placeholder.
  - The text box is optional. Learners can continue with only the preset options, only text, or both.
  - The text entered is saved with the rest of the onboarding answers.

### ONB-3: Allow multiple answers on "What would you love to do?"
- **Feedback:** Learners should be able to select more than one answer.
- **Change:** Turn the single choice into a multi-select.
- **Acceptance criteria:**
  - Learners can select and deselect several options.
  - The selected state is clear on each option (e.g. a checkmark or highlighted chip).
  - All selected values are saved.
  - The Continue button works once at least one option is selected (same requirement as now).

### ONB-4: Allow both options on "How would you like to learn?"
- **Feedback:** Learners should be able to choose both options (e.g. online and in person).
- **Change:** Turn the either/or choice into a multi-select.
- **Acceptance criteria:**
  - Learners can select one option or both.
  - Every later step that reads this answer (search filters, teacher matching, booking defaults) accepts both values.

### ONB-5: Remove "Find a match" from "How should we find your teacher?"
- **Feedback:** Remove the "Find a match" option.
- **Change:** Delete that option. Clean up any logic, routes or screens that only that option used.
- **Acceptance criteria:**
  - "Find a match" no longer appears.
  - The remaining option(s) work and lead to the right next screen.
  - If only one option is left, see Open questions.

---

## 2. Search and reviews

### SRCH-1: Show reviews on teacher cards in search results
- **Feedback:** Reviews should appear on the teacher cards in search results.
- **Change:** Add a rating summary to each teacher card: the average star rating and the number of reviews (e.g. ★ 4.8 (32)).
- **Acceptance criteria:**
  - Every card shows the average rating and the review count.
  - Teachers with no reviews show a neutral state (e.g. "New" or "No reviews yet"), not 0 stars.

### SRCH-2: Sort by rating and by price
- **Feedback:** Learners should be able to sort by rating and by price, from lowest to highest.
- **Change:** Add a sort control to the search results.
- **Acceptance criteria:**
  - Sort options include **Rating (highest first)** and **Price (lowest to highest)**.
  - Changing the sort reorders the results right away and keeps the filters already applied.
  - The selected sort option is visible.

### SRCH-3: Add availability filters and sort by time
- **Feedback:** Add availability filters such as Today and Tomorrow, and let learners sort by time.
- **Change:** Add quick availability filters and a sort option based on time (Doctolib pattern).
- **Acceptance criteria:**
  - The filters include at least **Today** and **Tomorrow**. Optional extras: This week, or a date picker.
  - Filtering by a day shows only teachers who have open slots that day.
  - A **Soonest available** sort option orders teachers by their next open slot.
  - Recommended: show each teacher's next available slots on their card (e.g. "Next: Today 14:00"), as Doctolib does.

### SRCH-4: Make reviews accessible across all relevant sections
- **Feedback:** Make reviews accessible across all relevant sections.
- **Change:** Wherever a teacher appears, show their rating and link it to the full reviews.
- **Acceptance criteria:**
  - Rating and review count appear on search cards, the teacher profile, the booking screen and lesson cards (where a teacher is shown).
  - Tapping the rating opens the teacher's full list of reviews.
  - The same component and format are used everywhere.

---

## 3. Teacher details

### TCH-1: Make the "Send a message" button easy to find
- **Feedback:** Make the Send a message button easy to find on the teacher's profile.
- **Change:** Move the button to a prominent, always-visible spot.
- **Acceptance criteria:**
  - "Send a message" is visible without scrolling. For example: next to the booking button, in a sticky bottom bar, or in the profile header.
  - It looks like a clear secondary action next to the main booking button. It doesn't compete with booking.

---

## 4. Booking and payment

### BKG-1: Remove the online/in-person explanatory text from the booking page
- **Feedback:** Remove the explanatory text for online and in-person lessons.
- **Change:** Delete the descriptive text. Keep the option labels and the selector itself.
- **Acceptance criteria:**
  - Learners can still choose online or in person.
  - The paragraphs explaining each option are gone.

### BKG-2: Remove the demo text from the payment screen
- **Feedback:** Remove the demo text from the payment screen.
- **Change:** Delete any placeholder or demo copy, such as "This is a demo" or test-card notes.
- **Acceptance criteria:**
  - No demo, test or placeholder text is left on the payment screen.

### BKG-3: Remove the booking status confirmation step and confirm bookings automatically
- **Feedback:** Remove the booking status confirmation step. Accept the booking automatically if the selected time slot is available.
- **Change:** Replace the request/pending/teacher-approval flow with instant booking.
- **Acceptance criteria:**
  - After payment, an available slot is booked right away. No "pending" or "awaiting confirmation" status.
  - The intermediate confirmation step or status screen is removed. The learner goes straight to a booking success screen and the lesson appears in Upcoming lessons.
  - The slot is checked again at the moment of booking. If someone else took it in the meantime, the learner sees a clear message and is asked to pick another slot. They are not charged.
  - The booked slot no longer shows as available to other learners.

---

## 5. Lessons

### LSN-1: Use a consistent footer throughout the Lessons section
- **Feedback:** Use a consistent footer throughout the Lessons section.
- **Change:** Use the same footer or bottom navigation component on every Lessons screen.
- **Acceptance criteria:**
  - Every screen in the Lessons section uses the same footer: same items, order, style and position.
  - The active tab or state is shown the same way everywhere.

### LSN-2: Make the difference between ongoing, upcoming and past lessons clear
- **Feedback:** Make the difference between ongoing, upcoming and past lessons clear, so learners know where to find each one.
- **Change:** Give each category its own clearly labeled section (e.g. tabs or segmented control: **Ongoing / Upcoming / Past**).
- **Acceptance criteria:**
  - Each lesson appears in exactly one category, based on its date and time:
    - **Ongoing:** the current time is between the lesson's start and end.
    - **Upcoming:** starts in the future.
    - **Past:** has ended.
  - The category names are visible, and each category has its own empty state (e.g. "No upcoming lessons. Find a teacher").
  - Lesson cards in each category show the actions that fit: Join for ongoing, Reschedule/Cancel for upcoming, Leave a review/Rebook for past.

---

## Open questions (default shown; change if needed)

1. **ONB-5:** If removing "Find a match" leaves only one option, should the question be removed entirely? *Default: remove the step and go straight to the remaining path.*
2. **SRCH-2:** Should price sorting also offer highest to lowest? *Default: offer lowest to highest only, as requested.*
3. **BKG-3:** Should teachers still be able to cancel a booking that was confirmed automatically? *Default: yes, through the existing cancellation flow.*
4. **ONB-1:** What is the exact new wording for Step 3? *Default: "How confident do you feel speaking [language]?"*

---

## Suggested implementation order

1. Quick copy and removal changes: `ONB-1`, `ONB-5`, `BKG-1`, `BKG-2`
2. Onboarding input changes: `ONB-2`, `ONB-3`, `ONB-4`
3. Reviews: `SRCH-1`, `SRCH-4`
4. Search sorting and filtering: `SRCH-2`, `SRCH-3`
5. Teacher profile: `TCH-1`
6. Lessons: `LSN-1`, `LSN-2`
7. Booking flow logic: `BKG-3`. This touches booking state and data, so test it last and thoroughly.
