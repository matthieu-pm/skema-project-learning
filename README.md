# Mimo

**One-to-one language learning, with a teacher you choose.**

Mimo is a SKEMA product design project exploring personal language tutoring, online or in person. It brings together learner and teacher research, product concepts, Figma designs, original companion characters, and an interactive onboarding prototype.

The idea is to help learners work toward a practical goal while giving teachers short, reusable, editable lesson materials. The repository documents that product hypothesis and its design exploration; the working app currently covers onboarding.

## Try the prototype

Use Node.js 22.12 or newer and npm. No API keys or backend setup are required.

```sh
git clone https://github.com/matthieu-pm/skema-project-learning.git
cd skema-project-learning/app
npm ci
npm run dev -- --host 0.0.0.0 --port 4173
```

Open [localhost:4173](http://localhost:4173). Use the device picker to switch between **iPhone** and **Pixel 10**, and enter **481629** when asked for the preview email code.

Choose **Learn** or **Teach** to explore the two onboarding paths. Choosing **Under 18** on the learner path also demonstrates the guardian handoff. Back preserves answers; Replay or a page reload resets the session.

## What works today

| Path | Included in the prototype |
| --- | --- |
| Learner | Multiple languages, a separate level for each language, a personal goal, optional learning resources, meeting preferences, and a setup summary. |
| Guardian | A handoff immediately after the email-code step, followed by the adult's sample identity flow before learner preferences. |
| Teacher | Profile details, optional photo/video, teaching languages and levels, approach, meeting preferences, lesson duration, rate, and profile review. |
| Identity preview | Sample document/selfie steps, a finish-later option, and a simulated Link Persona ID path. |

The browser preview includes device frames, a simulated keyboard, scrolling and gestures, safe areas, and a live status-bar clock. Purple **Luma** guides learners; blue **Nori** guides teachers.

**This is a frontend prototype.** Email, identity checks, guardian actions, notifications, and widget installation are simulated. No Persona service is connected. Answers stay in memory for the current page session, and selected files use local previews with a 20 MB limit; they are not uploaded.

Teacher discovery, booking, payment, live lessons, teacher workspaces, practice, and progress are proposed product areas. Home-screen concepts and broader wireframes are design artifacts, not connected app screens. There is no production authentication, database, or AI integration.

## Research and design

The product direction centers on practical conversation, a learner's choice of teacher, and teacher control over lesson content. Optional AI assistance remains a proposal. Social feeds, group sessions, public leaderboards, and mandatory daily streaks are outside the current scope.

| Resource | Contents |
| --- | --- |
| [Project context](context.md) | Research synthesis, scope, current decisions, source index, and known limitations. |
| [FigJam project board](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd) | Research, personas, ideation, scope, and the experience storyboard. |
| [Figma onboarding](https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5?node-id=7-22) | The original Start & Setup content and branches. |
| [Figma home concepts](https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5?node-id=82-679) | Learner and teacher homes, including first-visit states. |
| [Figma design system](https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5?node-id=101-248) | Foundations, companions, buttons, choices, inputs, feedback, and patterns. Includes clearly labeled proposed additions. |
| [Wireframe specification](all-models-and-images/wireframe-screen-index.md) | A 72-screen proposal covering the wider tutoring journey. |
| [Storyboard](output/storyboard/storyboard.md) | Twelve scenes spanning onboarding and the proposed learning experience. |

Some older assets use the name **One to One** or earlier companion assignments. See [context.md](context.md) for the current direction. Raw participant interviews are kept locally and excluded from this public repository; the research synthesis is included.

## Repository guide

| Location | Purpose |
| --- | --- |
| [`app/`](app/) | React 19, TypeScript, and Vite prototype, with Motion, Radix UI, and locally bundled fonts. |
| [`app/src/Prototype.tsx`](app/src/Prototype.tsx) | App screens and flow composition. |
| [`app/src/onboarding.ts`](app/src/onboarding.ts) | Answers, branching, choices, and validation. |
| [`app/src/prototype.css`](app/src/prototype.css) | App styling and learner/teacher palettes. |
| [`app/src/mobile/`](app/src/mobile/) | Protected mobile preview runtime and components. |
| [`all-models-and-images/`](all-models-and-images/) | Original companion artwork, editable Blender models, animation exports, and wireframe documentation. |
| [`output/`](output/) | Storyboard and Figma design construction records and exports. |
| [`reference/`](reference/) | Visual references and design-source snapshots. |

## Checks

Run these commands from `app/`:

```sh
npm run test:onboarding   # Branching and input validation
npm run check:runtime     # Integrity of protected mobile runtime files
npm run build             # TypeScript, Vite, and static-worker output
npx playwright install chromium
npm run test:runtime      # Browser tests for the mobile runtime
npm run test:sites        # Static hosting output checks; run after build
```

See [app/README.md](app/README.md) for detailed flows and [app/design-qa.md](app/design-qa.md) for dated verification notes. Read [context.md](context.md) and [app/AGENTS.md](app/AGENTS.md) before changing the app; preserve the protected device runtime and original design assets.
