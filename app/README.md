# Mimo onboarding

A local React/TypeScript mobile prototype for one-to-one language learning. The Figma Start & Setup flow provides the content and learner/teacher branches; the original Mimo onboarding supplies the visual design.

## Run

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 4173
```

Open http://localhost:4173. The device picker switches between iPhone and Pixel 10. The preview scales to small browser windows.

## Flow

- Shared: welcome, Mimo greeting, learner/teacher role, introduction, email, and email-code preview. Learners also choose an age range, with a guardian handoff when under 18. Use **481629**.
- Learner: one or more languages (no search, with a coming-soon note), a separate CEFR level for each selected language, learning context, personal goal, optional attachment, encouragement, meeting format, optional city/days/time, notifications, an encouraging companion widget, benefits, identity-verification preview, and setup summary. Adult learners verify themselves; under-18 learners hand over to their parent or guardian immediately after email-code verification, before choosing a language. The guardian uses their own identity details. Completing or deferring the guardian check resumes learner preferences; it is not repeated after benefits. Both can finish verification later.
- Teacher: introduction, display name, optional profile media, teaching languages, levels, approach, meeting format, city, lesson duration, price, profile review, and optional sample identity-verification sequence, including date of birth after legal name. Teachers do not answer the earlier age-range question.

The verification introduction also offers Link Persona ID, a local instant-verification preview with a document fallback. No Persona service is connected.

Each decision or entry has its own screen. Online meetings skip city. Back preserves answers; Replay and reload reset. Existing welcome, greeting, encouragement, notification, widget and benefits screens remain where useful. The subscription and mock placement-score screens have been removed because they do not belong to this tutoring setup.

All state is local to the current page session. Attachments use local object URLs (20 MB maximum), not network uploads. Email, guardian handoff, identity checks, notifications and widgets are simulations. Teacher discovery, booking, authentication, storage and verification providers are not connected.

## Sources

- Content: https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5/One-to-One-Start-Setup?node-id=7-22
- Source mapping: `../reference/figma/flow-map.md`; section capture: `../reference/figma/start-setup.png`.
- Original visual reference: https://mobbin.com/flows/b0b4f93f-5637-46ec-9d77-49ecda6b991d
- Companions: purple Luma for learners and blue Nori for teachers, copied locally from `../all-models-and-images/pets/` without modifying the originals.
- Flags and option illustrations: local assets extracted from the original flow captures.
- Font: locally bundled Nunito.

App UI lives in `src/Prototype.tsx` and `src/prototype.css`. Routing and validation live in `src/onboarding.ts`. Protected mobile runtime files are unchanged.

## Verification

`npm run test:onboarding` checks branching, progression and required inputs. `npm run build` checks TypeScript, creates the production build and verifies mobile runtime integrity. Rendered checks and captures are recorded in `design-qa.md` and `qa/step-update/`.
