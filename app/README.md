# Mimo prototype

A local React/TypeScript prototype for one-to-one language learning, with onboarding and an interactive teacher workspace on web and mobile. The Figma Start & Setup flow supplies onboarding content; current teacher screens follow the supplied architecture and FigJam goal flows.

## Run

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 4173
```

Open http://localhost:4173. The device picker switches between iPhone and Pixel 10. The preview scales to small browser windows.

Direct workspace previews: [teacher web](http://localhost:4173/?teacher=1&view=web) and [teacher mobile](http://localhost:4173/?teacher=1). Teacher onboarding completion also opens the mobile workspace with the public profile details just entered.

## Flow

- Shared: welcome, Mimo greeting, learner/teacher role, introduction, email, and email-code preview. Learners also choose an age range, with a guardian handoff when under 18. Use **481629**.
- Learner: one or more languages (no search, with a coming-soon note), a separate CEFR level for each selected language, learning context, personal goal, optional attachment, encouragement, meeting format, optional city/days/time, notifications, an encouraging companion widget, benefits, identity-verification preview, and setup summary. Adult learners verify themselves; under-18 learners hand over to their parent or guardian immediately after email-code verification, before choosing a language. The guardian uses their own identity details. Completing or deferring the guardian check resumes learner preferences; it is not repeated after benefits. Both can finish verification later.
- Teacher: introduction, display name, optional profile media, teaching languages, levels, approach, meeting format, city, lesson duration, price, profile review, and optional sample identity-verification sequence, including date of birth after legal name. Teachers do not answer the earlier age-range question.

The verification introduction also offers Link Persona ID, a local instant-verification preview with a document fallback. No Persona service is connected.

Each decision or entry has its own screen. Online meetings skip city. Back preserves answers; Replay and reload reset. Existing welcome, greeting, encouragement, notification, widget and benefits screens remain where useful. The subscription and mock placement-score screens have been removed because they do not belong to this tutoring setup.

All state is local to the current page session. Attachments use local object URLs (20 MB maximum), not network uploads. Email, guardian handoff, identity checks, notifications and widgets are simulations. Teacher discovery, booking, authentication, storage and verification providers are not connected.

## Teacher workspace

Four sections follow the October 10 architecture: Students (profiles, ongoing modules, messages), Schedule (Day/Week/Month calendar, availability and session management), Lessons (Module editor, Archive, Library, Templates), and Profile (Help, Account settings, Payout).

Lesson preparation supports reusable sources, learner-specific adaptation, editable blocks, optional sample AI review, learner preview, approval, and deliberate sharing. Session flows include meeting requests, conflicting slots, replacement acceptance, cancellation, no-show reports, a sample online lesson, human feedback, and private recap sharing. Profile, identity, payout status, failed-send retry, and AI failure are interactive previews.

Learner views exclude private notes. Adaptation preserves the source lesson; completed sessions retain snapshots; rescheduling preserves the original booking until replacement acceptance. Offline and AI-unavailable controls are under Account settings. The sample calendar is in October 2026 and availability supports Europe/Paris only. All changes reset on reload. There is no real messaging, calendar, video, AI, payment, verification, backend, native binary, or cross-device synchronization.

## Sources

- Content: https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5/One-to-One-Start-Setup?node-id=7-22
- Source mapping: `../reference/figma/flow-map.md`; section capture: `../reference/figma/start-setup.png`.
- Original visual reference: https://mobbin.com/flows/b0b4f93f-5637-46ec-9d77-49ecda6b991d
- Companions: purple Luma for learners and blue Nori for teachers, copied locally from `../all-models-and-images/pets/` without modifying the originals.
- Flags and option illustrations: local assets extracted from the original flow captures.
- Teacher workspace visual reference: https://mobbin.com/flows/67d21fa1-0aba-4f35-9615-35dd8102342d
- Teacher flows: https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=440-2676 and additional flows at node `466:3308`, plus the supplied October 10 architecture screenshot.
- App font: locally bundled Labil Grotesk; platform chrome retains its protected runtime typography.

App UI lives in `src/Prototype.tsx` and `src/prototype.css`. Routing and validation live in `src/onboarding.ts`. Protected mobile runtime files are unchanged.

The lazy-loaded teacher workspace lives in `src/teacher/`, with shared state, model, controls, pages, and web/mobile styling. Its Uxcel-inspired design uses Hugeicons and actual generated shadcn sidebar-08 primitives, including desktop collapse and a responsive drawer. Its buttons and cards blend that layout with onboarding: rounded raised actions, stronger card outlines and restrained pastel accents, styled in `onboarding-blend.css`. Tailwind utilities omit preflight to preserve the mobile runtime.

The full calendar supports Day, Week and Month, previous/next navigation, status filters, clickable sessions and month-date drill-down. Web defaults to Week and mobile to Month. “Today” returns to the clearly labeled sample date 10 October 2026. Timed bookings use their durations and overlap columns; Europe/Paris offsets follow the selected date.

## Verification

`npm run test:onboarding` checks branching, progression and required inputs. `npm run build` checks TypeScript, creates the production build and verifies mobile runtime integrity. Rendered checks and captures are recorded in `design-qa.md` and `qa/step-update/`.

`npm run test:teacher` checks conflicts, adaptation, private lesson snapshots, profile transfer, architecture parent tabs, calendar date boundaries and overlapping-event placement. Teacher flow verification and screenshots are in `qa/teacher-workspace/verification.md`.
