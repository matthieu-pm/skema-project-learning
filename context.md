# SKEMA project learning — Mimo project context

Last consolidated: **2 October 2026**. Read this file when starting a new chat. Paths below are relative to this project root unless stated otherwise.

## Project at a glance

Mimo is a mobile product concept for **one-to-one language tutoring with a teacher chosen by the learner**, online or in person. Earlier design material calls it **One to One** or **one to one**. The current app name remains **Mimo**; Mimo is also the name of an older green companion character, so distinguish the brand from the mascot.

The project contains research and personas, ideation and scope decisions, an experience storyboard, a broad wireframe specification, Figma onboarding and home-screen designs, original companion images and editable Blender models, and a working frontend onboarding prototype in `app/`.

**Implemented today:** learner, guardian, and teacher onboarding with simulated account and identity checks. **Proposed beyond onboarding:** teacher discovery, booking, payment, lessons, teacher workspace, practice, progress, and follow-up. The prototype has no connected backend or production services.

The central product hypothesis is that a teacher can turn a learner's practical goal into a useful, short, editable one-to-one lesson with less preparation and administration. This is a hypothesis to test, not a validated business result.

## Source authority and how to read this context

1. The user's latest explicit decisions govern the work.
2. `app/AGENTS.md`, `app/src/onboarding.ts`, `app/src/Prototype.tsx`, and `app/src/prototype.css` describe the current onboarding implementation and design direction.
3. FigJam's explicit scope rules govern the wider product concept; early brainstorm ideas are not all approved scope.
4. Figma Start & Setup supplies onboarding content and branches. The existing Mimo app supplies its visual language; do not automatically restyle the app to match the older Figma palette.
5. Older companion, wireframe, storyboard, and QA material remains useful history but can conflict with newer decisions. See the discrepancies section below.

This document consolidates project knowledge and provides a source index. Complete screen specifications, raw accessible board text, source imagery, and detailed QA remain in the linked files; they are not all reproduced verbatim here. Figma and FigJam were read through the connected Figma tools on 1 October 2026. Text/structure inspection does not establish visual quality, usability, or animation playback.

## Main links

| Resource | Link | What it contains |
| --- | --- | --- |
| Figma design file | [One to One / Start & Setup](https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5) | Archived onboarding, companion onboarding, local components, and named Blender animation components. File key: `w4nc4L3hNF63uh2HBX9Np5`. |
| Figma content source | [Start & Setup, section 7:22](https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5/One-to-One-Start-Setup?node-id=7-22) | Eight high-fidelity A1–A8 screens used to derive app content. |
| Figma companion edition | [S1 Welcome, node 27:1319](https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5?node-id=27-1319) | Entry to the 24-screen companion edition on page `26:248`. |
| Figma current home concepts | [Learning and teaching homes, node 82:679](https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5?node-id=82-679) | Four editable home screens matching the current prototype, on page `82:248`, “Home · Mimo prototype”. Created 2 October 2026. |
| FigJam project board | [Research, ideation, scope, and storyboard](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd) | Learner/teacher interviews, synthesis, personas, brainstorm clusters, scope, Six Thinking Hats notes, and illustrated storyboard. File key: `AYNNAqQDARTmwlsa6AYHsd`; page `0:1`, “Page 1”. |
| FigJam storyboard | [Mimo experience storyboard, section 207:1777](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=207-1777) | Twelve scenes across learner setup, teacher setup, and their proposed shared journey, with source notes. |
| tldraw wireframes | [One-to-one language tutoring · Mobile wireframes](https://www.tldraw.com/f/JCGxbET3aWyujI3qfG1Pe) | Broad 72-screen structural proposal across nine flow groups plus an overview. See local index for the full specification. |
| Original visual reference | [Mobbin flow](https://mobbin.com/flows/b0b4f93f-5637-46ec-9d77-49ecda6b991d) | Original Duolingo-inspired onboarding reference; local captures are in `reference/`. |

The tldraw board and Mobbin page were not re-read during this documentation pass; their links and descriptions come from local project sources. The local wireframe index is not proof that every screen currently renders on tldraw.

## Product scope and principles

- Exactly one learner and one chosen teacher per session. Learners choose; no automatic assignment or forced matching.
- Support online and in-person tutoring. Keep practical conversation and human feedback central.
- Organize lessons around a specific academic, everyday, or professional topic and a clear outcome.
- Keep course/lesson creation short, modular, reusable, and editable; avoid writing-heavy long-form authoring.
- Reduce administrative work through goals, materials, scheduling, communication, reminders, and teacher-approved summaries.
- AI may assist with lesson drafts, resources, summaries, speaking practice, or an initial writing evaluation. Teachers retain editing and final evaluation control; AI is optional.
- Encourage accountability through simple private feedback. The product should feel reassuring, respectful, clear, manageable, and under the user's control.
- Exclude social feeds, public leaderboards, friend-following, study groups, group sessions, mandatory daily activities, streak commitments, and long-form courses from the current scope.
- Advanced AI should remain outside an initial version unless it clearly helps the central tutoring workflow.

Primary scope anchors: [don'ts, 156:2005](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=156-2005), [do's, 156:2022](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=156-2022).

## FigJam research and personas

### Research material available

The board includes a learner interview table (`86:1667`, 10 participant columns), a teacher interview table (`11:55`, 15 participant columns), interview questions, analysis labels/charts, affinity/synthesis notes, and multiple persona revisions. Learner research is grouped within section `86:1666`; learner questions are at `86:2211` and the primary persona summary at `86:2136`.

Learner questions cover habits, existing methods/platforms, recent consideration of one-to-one tuition, frustrations, situations that need human help, ideal experiences, acceptable AI recommendations versus retained control, outcomes, and device/technology comfort. Teacher research covers teaching languages and levels, frequency, course structure, delivery format, authoring tools, acquisition of students, technology and AI comfort, preparation work, frustrations, and ideal teaching tools.

The board includes summaries with **8-person and 15-person denominators**, duplicated synthesis cards, and some inconsistent/raw entries. Do not pool them into a new sample size, assume independence, or present their frequencies as representative market statistics. Raw participant details are retained in the source snapshot, rather than copied into this startup summary.

### Learner findings

- Learners want usable conversation, pronunciation, comprehension of natural speech, and confidence in everyday contexts; some also have exams, professional goals, or cultural interests.
- Pain points include speech that is too fast, the gap between spelling and pronunciation, forgetting vocabulary, unclear grammar/structure, and difficulty expressing nuance or humor.
- Some find apps generic, too basic, repetitive, inaccurate, or poor at meaningful pronunciation correction. Others are satisfied with self-paced tools or prefer immersion without formal tutoring; research does not support claiming that everyone wants this app.
- Human teaching matters for patience, explaining the logic of a language, follow-up questions, correction, and local speech/culture. Teacher fit and respectful behavior matter; pressure or a patronizing tone can discourage learners.
- Attitudes to AI vary from enthusiasm and quick-help use to skepticism. It should support learning and choice rather than replace a teacher or dictate who to learn with.
- Desired experiences include patient compatible teachers, real-world practice, appropriately challenging progress, natural speech examples, flexible/self-paced support, and effective controls such as audio replay/speed.

### Teacher findings

- Personalized preparation, grading, file organization, and unpaid administration consume time. Reusable resources, editable templates, remembered learner goals/mistakes, and short lesson blocks are promising responses.
- Online teaching can make attention, participation, pronunciation assessment, and relationship-building harder. Teachers often value in-person interaction and practical/open-ended exercises.
- Creative control matters: a useful tool supports the teacher's judgment, level adaptation, and existing materials rather than imposing a rigid curriculum.
- Concerns include students relying on AI/translation, unrealistic speed-of-progress expectations, cancellations/no-shows, fragmented tools, high platform commissions, clutter, and technical friction.
- The research includes teachers who prefer printable editable worksheets or a simple resource library and do not want a full management platform. This limits how broadly the platform proposition can be generalized.

Selected board synthesis counts, preserved with their original denominators:

| Theme | Earlier 8-person summary | 15-person summary |
| --- | --- | --- |
| Student engagement / online attention | 8/8 | 11/15 |
| Preparation workload / burnout | 5/8 | 7/15 |
| Over-reliance on AI / translation | 4/8 | 5/15 |
| Limits of purely gamified apps | 4/8 | 6/15 |
| Digital tools cannot replace human interaction | 5/8 | 8/15 |
| Blending human teaching with AI/digital tools | 8/8 | 9/15 |
| Practice beyond class | 5/8 | 8/15 |
| Automated planning/exercise/grading/feedback support | 6/8 | 8/15 |

Additional 15-person cards report creative control (8/15), reduced non-teaching work (6/15), personalized level-appropriate learning (5/15), and lesson/exercise/worksheet planning support (12/15). These are board-coded themes, not independently re-audited statistics.

### Personas

| Persona | Need and implications | Source |
| --- | --- | --- |
| **Léa Martin — seeks human guidance** | Wants a patient compatible teacher, natural everyday conversation, adaptation to her goals/pace, and personalized correction. Generic apps, poor teacher fit, and weak feedback frustrate her. | [44:2453](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=44-2453) |
| **Lucas Bernard — seeks real-life experiences** | Values native media, authentic speech, culture, independence, and real conversations. Fast speech, pronunciation, and formal lessons that miss slang/nuance are barriers. | [44:2209](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=44-2209) |
| **Maya Kapoor — seeks quick progress** | Practices consistently but wants visible improvement, adaptive difficulty, targeted feedback, and a way past basic material. Will try tutoring or AI if it improves effectiveness. | [43:2819](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=43-2819) |
| **Gilbert — adaptive language teacher** | Teaches English, Chinese, and French; mixes structured teaching and tutoring, adapts to goals/levels, prefers personal interaction, and wants less preparation/admin while retaining control. | [74:2049](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=74-2049) |

Personas are synthesis artifacts, not literal interview quotations or a single verified customer profile. Gilbert has multiple board revisions with different demographic labels; do not silently select one as settled. Maya is a learner persona here; unrelated wireframe/sample app data also uses “Maya” as a teacher name.

## FigJam ideation, feature clusters, and risk notes

An editable [impact–effort matrix, section `227:1777`](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=227-1777) was added below the brainstorm on **2 October 2026**. Impact increases upward; effort increases to the right. Quadrants are **Do now** (high impact / low effort), **Do next** (high / high), **Do later** (low / low), and **Don’t do** (low impact / high effort). The areas are empty for collaborative idea placement; this is a prioritization template, not an agreed feature ranking or delivery roadmap. The final matrix was visually checked for readable labels and correctly positioned axes; existing ideas were preserved.

The original [Brainstorm section, 132:1682](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=132-1682) groups ideas around scheduling/communication, teacher workspace, live learning/AI, resources/practice, feedback/progress, and teacher recognition. Later clusters are:

| Cluster | Node | Contents / status |
| --- | --- | --- |
| AI-powered learning and feedback | `132:1842` | AI assistance, first-pass essay evaluation with teacher final review, speaking/accent support, summaries. Proposed, not connected. |
| Teacher tools and dashboard | `132:1847` | Modular block-based lessons, editable content, teacher homepage, learner goals, reusable materials. Central proposed workflow. |
| Scheduling, booking, and calendar | `132:1852` | Online/in-person bookings, availability, Google/Outlook calendar ideas, confirmations, emails, reminders. Proposed integrations. |
| Student engagement and gamification | `132:1856` | Activities and engagement ideas. Daily obligations, leaderboards, and social expansion are overridden by scope decisions. |
| Content and resource library | `132:1859` | Level-appropriate music, shows, podcasts, videos, resources, uploads/downloads, relevant practice. Proposed. |
| Live and interactive communication | `132:1862` | One-to-one video, messages, speaking, and real human interaction. Proposed. |

Teacher rewards/recognition, promotions, public ratings, daily speaking, AI chat, and friend-following occur in early ideation. Their presence on the board is not approval to implement them. The intended feedback is private; public-rating/review mechanics remain unresolved where older discovery examples suggest them.

Six Thinking Hats material includes:

- **Facts** (`156:2122`): human interaction, practical application, varied learner needs, teacher preparation, and supportive AI recur in the research.
- **Benefits** (`162:1886`): more personalized lessons, less preparation, human-led learning, practical speaking, and lower effort.
- **Feelings** (`165:1878`): reassured, in control, not overloaded, trusting, motivated, and capable; simple setup, transparency, and respectful choice help.
- **Cautions** (`156:2097`): privacy/safety, discomfort meeting strangers, excessive setup, ineffective digital learning, teacher workload/compensation, competition, price, harassment, AI coasting, no-shows, manipulated rewards, and poor teaching.
- **Creative alternatives** (`156:2108`): online tutoring, existing courses/apps, in-person lessons, and a smaller product based on goal briefs, editable templates, clear outcomes, summaries, and private reviews.
- **Scope/process direction** (`156:1983`, `156:2005`, `156:2022`): focus the product on tutoring and reduce unnecessary authoring/admin. The board's note “Being creeps → ID verification” (`167:1922`) is an idea, not evidence that identity checks solve safety.

## Figma design contents

### Mimo design system — created 2 October 2026

[Design-system cover, `101:248`](https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5?node-id=101-248). Eight new pages (`92:248`–`92:255`) document the current prototype: getting started, foundations, pets/icons, buttons, choices, inputs, feedback, and patterns. The library contains **135 component masters/variants, 19 component sets, 13 new Nunito text styles, four effect styles, 108 new variables and 16 reused primitives**. Semantic aliases support Learner and Teacher modes. Components also expose Role variants; explicit component modes override parent frame modes, so use the matching Role variant.

Includes all four original pets—purple Luma, blue Nori, green Mimo, yellow Pip—plus Luma lookout; 12 editable vector icons; source language flags and Persona branding. Pets remain original raster artwork in editable component containers. Mimo and Pip are library assets, not new app role assignments.

Extended palettes, accessible primary alternatives, status badges, disabled/outlined-error fields, empty cards and dialogs are clearly labeled **design additions, not implemented app behavior**. Home navigation reuses the existing proposed home components. Bright prototype buttons are preserved, with contrast limitations and darker proposed alternatives documented. Interaction states are static specimens; no pet motion playback is claimed.

All eight review sheets were visually inspected. Targeted fixes addressed asset scaling, label wrapping, specimen property values, input fitting and speech pointers. Final structural checks found no overflowing review text, unstyled component text, or unbound solid fills on component roots. New variable scopes, code syntax and semantic aliases passed; reused source primitives received code syntax metadata. All 28 protected runtime files passed integrity checks; no app code changed.

Handoff records: `output/design-system/README.md`, `state.json`, `validation.json`, `tokens.json`, `tokens.css`, `source-map.json`, construction scripts and `cover-preview.png`. Token CSS is an export only, not imported by the app. Hosted Code Connect is blocked by the current Figma plan/seat (connector requires Organization/Enterprise with Dev/Full seat); local source mappings are provided. The library is available within this design file and has not been published as a shared team library.

The 1 October inspection found the two historical pages below. On 2 October, a third page, **Home · Mimo prototype**, was added for the current home-screen concepts.

### Home · Mimo prototype — page `82:248`

Created on **2 October 2026** at the user's request, using the running onboarding prototype as the visual authority and live tldraw B1/F1 content as reference. The historical wireframe layout was not copied. These are proposed designs beyond onboarding, **not implemented app screens**.

Review board: [Mimo · Learning & teaching homes, `82:679`](https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5?node-id=82-679).

| Home state | Node | Main content |
| --- | --- | --- |
| Learning · Next lesson | `84:345` | Next lesson with chosen teacher, optional teacher-provided practice, editable personal goal. |
| Teaching · Today | `84:438` | Prepare next learner's lesson, updated goal brief, speaking submission to review, later session. |
| Learning · First visit | `84:530` | Find a teacher, saved learning goal, explanation of where future bookings appear. |
| Teaching · First visit | `84:603` | Set availability, create a reusable short lesson, empty schedule explanation. Assumes profile is ready; verification-pending behavior is not designed here. |

All four frames are **390 × 844**, with Nunito, the current purple/blue role palettes, raised buttons/cards, and the original Luma/Nori assets copied from `app/public/assets/onboarding/`. Learner navigation: Home / Explore / Sessions / Profile. Teacher navigation: Today / Learners / Lessons / Profile. Messages are in the header. Navigation and home actions are design affordances, not connected prototype routes. Names, sessions, times, submissions, and goals are sample content; the static 9:41 mock status bar does not change the app's live device clock.

The page includes six reusable local components (two companions, two role buttons, two role navigation bars), color variables, and Nunito text styles. Existing onboarding pages remain unchanged. Visual review passed after correcting auto-layout row heights and companion scaling. Structural read-back confirmed **334 descendants, including 92 editable text nodes and 12 component instances**; the only raster content is four original companion images. All content clears the bottom navigation, and all text uses Nunito. This is design verification, not usability testing or runtime integration.

Local records: `output/home-designs/build-figma.js`, `output/home-designs/figma-state.json`, and `output/home-designs/homes-final.png`. The build script is a guarded construction record, not a general resync tool. The runtime integrity check also passed for all 28 protected files; no app implementation was changed.

### Archive · Start & Setup v1 — page `0:1`

The page contains `Local components` (`3:48`), `Variant states` (`7:560`), and **Start & Setup / high-fidelity screens** (`7:22`). Each A-screen is 390 × 844. This is the content source used for the current app.

| Screen | Node | Content and app adaptation |
| --- | --- | --- |
| A1 · Welcome | `7:27` | Welcome/role, expanded into welcome → greeting → role → setup introduction. |
| A2 · Your account | `7:94` | Email and age; learner age/guardian branch retained, teacher early age question removed. |
| A3 · Check your email | `7:142` | Passwordless code, retry/resend, change email; simulated in app. |
| A4 · Language & level | `7:199` | Language and level; app now supports multiple learner languages with a separate level per language. |
| A5 · Your goal | `7:266` | Learning context, concrete goal, and optional resources split into separate screens. |
| A6 · Meeting preferences | `7:343` | Format, location, days, time; online skips city. |
| A7 · Teacher profile | `7:417` | Name/media, teaching languages/levels, approach, format/location, duration, rate, and review. |
| A8 · Identity verification | `7:471` | Expanded into a sample identity sequence, with a finish-later exit. |

Local mapping: `reference/figma/flow-map.md`. Section image: `reference/figma/start-setup.png`. Captured structural metadata: `reference/figma/start-setup-archive-metadata.xml`.

### Start & Setup · Companions — page `26:248`

This separate iteration has **24 mobile screens**, each 390 × 844, in three sections. It uses the older “one to one” brand and character assignments. Sample content, labels, and prototype handoffs do not establish live authentication, search, payments, uploads, or a verification provider.

| Section | Screens and node IDs |
| --- | --- |
| **01 · A friendly start** (`27:1310`) | S1 Welcome `27:1319`; S2 Your role `27:1342`; S3 Email `27:1383`; S4 Age `27:1420`; S5 Email verification `27:1457`. |
| **02 · Find your kind of teacher** (`27:1313`) | L1 Language `27:1504`; L2 Level `27:1556`; L3 Learning topic `27:1608`; L4 Personal goal `27:1660`; L5 Lesson format `27:1698`; L6 City `27:1745`; L7 Available days `27:1782`; L8 Time of day `27:1831`; L9 Ready to find a teacher `27:1884`. |
| **03 · Share what you know** (`27:1316`) | T1 Teacher name `27:1914`; T2 Profile photo `27:1948`; T3 Teaching languages `27:1986`; T4 Teaching levels `27:2038`; T5 Teaching approach `27:2085`; T6 Teaching format `27:2122`; T7 Teaching city `27:2169`; T8 Lesson rate `27:2206`; T9 Identity verification `27:2243`; T10 Verification pending `27:2280`. |

Content highlights: a real teacher and practical conversation; learn/teach role choice; passwordless email; one preference per screen; practical goals; online/in-person choice; city rather than home address; optional availability; a short teacher introduction; editable pricing; private identity documents; profile held pending review. The companion design includes illustrative values such as a birth date, code **248106**, Paris, and **€25 / 60 minutes**. These differ from the current app and are not production policy.

The page also contains:

- `Companions / local components` (`26:249`): Pet/Mimo, Pet/Luma, Pet/Pip, Pet/Nori, primary/secondary buttons, and default/selected choices.
- `Blender · 24 animated model renders` (`37:676`): named components for S1–S5, L1–L9, T1–T10. Gestures include waves, nods, head tilts, springs, encouragement, looking around, arm taps, stretching, a bow, camera pose, and a thank-you bow.
- A locally captured inventory with every screen's extracted text: `reference/figma/companion-page-snapshot.json`.

The animation component names and GIF metadata were observed, but actual Figma playback remains unverified.

## FigJam experience storyboard

[Section 207:1777](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=207-1777) contains three rows of four scenes:

1. **Léa finds a starting point** (`208:1777`): hesitation ordering at a café → friendly learner setup → a personal goal → preferences and readiness.
2. **Gilbert gets ready to teach** (`208:1808`): preparation competes with teaching → show his approach → set format/duration/price expectations → optional private verification preview.
3. **Their paths meet** (`208:1839`): choose a teacher and book → prepare one useful editable lesson → practise with a real person → use feedback and relevant practice in real life.

Scenes 1 and 5 are research-based illustrative situations; 2–4 and 6–8 describe onboarding; 9–12 propose the experience beyond the implemented app. Thought captions are invented scenario narration, **not interview quotations**. The board includes source notes (`209:1777`) on personas, branches, human control, open questions, and prototype boundaries.

Local files are in `output/storyboard/`: `storyboard.md` (all scene copy and source node references), `draw-scenes.mjs` (editable vector generation), `editable-scenes.svg`, `storyboard-overview.png`, `storyboard-lesson-detail.png`, and `source-notes.png`. The illustrations are editable vector scene drawings imported into FigJam; local notes record that image generation failed and vectors were used instead.

**Known stale scene:** scene 4 / node `208:1805` still mentions a small practice target and reminders. The app has since removed daily practice goals and uses a general notification choice. Do not reintroduce those removed screens based on the storyboard. No storyboard/Figma edits were made during this documentation task.

## Broader wireframe proposal

`all-models-and-images/wireframe-screen-index.md` is the full **72-screen** index, with primary actions, onward routes, state behavior, and research-to-design rationale. It describes structural 390 × 844 wireframes, not an implemented full product.

| Group | Eight proposed screens |
| --- | --- |
| A · Start & setup | Welcome; account; verify email; language/level; goal; preferences; teacher profile; identity verification. |
| B · Find & book | Learner home; discovery; filters; teacher profile; lesson preview; goal brief; time/place; checkout. |
| C · Manage & communicate | Confirmation; sessions list; session details; reschedule; cancellation; inbox; conversation; notifications. |
| D · Meet & reflect | Online lobby; video session; in-person session; shared activity; shared notes; recap; private review; report/block. |
| E · Practice & progress | Practice hub; resource detail; speaking recorder; optional AI role-play; writing submission; feedback; saved materials; personal progress. |
| F · Teacher workspace | Teacher today; students; learner detail; lesson library; lesson brief; modular editor; block editor; AI draft review. |
| G · Teach & manage | Learner-view preview; share lesson; availability; calendar connections; submissions; evaluation; approve recap; earnings. |
| H · Account & recovery | Account; profile; preferences; privacy/safety; empty states; slot unavailable; offline/reconnecting; payment recovery. |
| I · Exceptions & trust | No-show/session issue; AI failure; add material; verification status; permissions; delete account; payout setup; guardian-managed learner. |

Research-to-design mapping: preparation workload → reusable lesson blocks; creative control → editable drafts and review; human interaction → chosen teachers and live/in-person conversation; practical learning → concrete outcomes; admin burden → scheduling/reminders/approved recap; accountability → private reflection and reporting.

Important proposed state behaviors: preserve drafts on failures, do not mark unsent work as shared, allow manual work when AI fails, keep pending payments distinct from failed payments and prevent duplicate retries, use purpose-specific permissions, and treat external provider forms as handoffs.

People, commercial terms, and locations are examples. The index's **€30 session, 10% teacher fee, €0 booking fee, and 24-hour cancellation rule** are placeholders for validation. Do not turn them into product policy. The 72-screen count describes the local specification; full current board rendering was not verified in this pass.

## Current app: scope and behavior

### Shared setup

Welcome → Luma greeting → learn/teach role → setup introduction → email. Learners then choose `18 or older` or `Under 18`; under-18 learners provide a different guardian email before code entry. Teachers skip the early age-range/guardian screens.

The working preview email code is **481629**, with a 30-second resend countdown after requesting another preview code and a change-email action. Email/account creation is simulated. Returning-account entry also leads into the preview; it is not connected sign-in.

### Learner path

- Choose one or more of Spanish, French, German, Italian, English, and Japanese. Checkboxes; no learner search; a “More languages / Coming soon!” card.
- Set **one independent level for each selected language**, using A1–C2 or “I'm not sure yet.” Deselecting a language deletes its saved level.
- Choose Everyday life, At work, or For my studies; enter a personal learning goal (at least 3 characters, UI maximum 300); optionally attach a resource.
- Encouragement → meeting format → city unless Online → weekdays/weekends (one or both) → time of day. Preferences can be deferred; summaries show flexible choices.
- General notification choice (“Allow notifications” / “Not now”) → optional widget preview with Luma saying **“You've got this!”** → benefits.
- Adult learners then have the sample identity sequence or finish-later option, followed by a summary. The summary is the end of this prototype, before discovery.
- **No daily-minute target, routine, commitment, streak, subscription, or placement-score flow.** A personal learning objective remains.

### Under-18 learner / guardian branch

Guardian email is collected before the email-code screen. **Immediately after successful code entry**, the app asks the learner to hand over to the guardian and runs the adult's identity preview before language selection. Completing or deferring verification resumes at language selection. Verification is not repeated after benefits. The adult uses their own details, not the child's ID. Switching age branches clears guardian/identity state.

No guardian invitation is sent, no consent is recorded, and no legal age/eligibility policy has been established by this prototype.

### Teacher path

Teacher introduction → display name → optional photo/video → teaching languages (multi-select, searchable) → teaching levels (multi-select A1–C2) → short approach → format → city unless Online → duration (30/45/60 minutes) → rate → profile review → sample verification or finish later.

The rate must be greater than 0 and no more than €1,000 in the prototype validator. Display name requires at least 2 characters; teaching approach at least 5 (UI maximum 300). These validation limits are implementation details, not validated pricing or eligibility policy. Profile information stays a local draft.

### Identity preview

The introduction now also offers **Link Persona ID** with the user-supplied logo. This opens a clearly labeled local sample-link screen, bypasses document/selfie entry, and continues to the teacher completion, adult learner summary, or guardian language-selection step. Users can return to the document flow. It is a concept preview only: no Persona sign-in, API, account link, or real verification is connected.

Introduction → legal name → **date of birth** → issuing country → document type (passport, national identity card, driving licence) → sample document → sample selfie. Date entry formats as DD/MM/YYYY, rejects impossible/future dates, and restores on Back. Do not invent a minimum teaching age.

Teacher deferral ends at `teacher-draft`; adult learner deferral ends at `learner-ready`; guardian completion/deferral resumes at `language`. Identity verification is separate from teaching qualification. No camera, real identity-document upload, or verification provider is used.

### State and media

- State is in React memory for the current page session. Back preserves answers; Replay and reload reset them. There is no persistent account/storage service.
- Role switching resets branch answers and local media while retaining email/age in the current implementation.
- Optional profile media accepts images/video. Learning resources accept document, image, and audio types. File selection uses local object URLs with a **20 MB** limit, local previews, replacement/removal, and URL cleanup.
- Email, guardian actions, identity verification, notifications, and widget installation are simulations. There is no discovery, booking, payment, calendar, video-call, AI, or backend integration.

## Current visual and interaction direction

- Preserve **Mimo**, locally bundled **Nunito**, rounded cards, raised CTAs, colored selected states, and companion speech bubbles. Use one decision or entry per screen.
- **Learner/default:** purple primary `#9955e8`, blue selections, **Luma** (purple/lilac). The shared welcome uses Luma.
- **Teacher:** blue primary `#1cb0f6`, orange selections, **Nori** (blue). Preserve role-specific copy and routing.
- Use supplied original character assets. App copies live in `app/public/assets/onboarding/`; originals remain in `all-models-and-images/pets/`.
- Press feedback must use transforms without changing sibling layout. CTA pressed state must release after the click; focus alone must not look pressed. Preserve visible keyboard focus and reduced-motion support.
- Fit ordinary onboarding above the fixed CTA where practical, particularly language/level lists, widget, and completion. Avoid duplicate companion illustrations on summaries. Keep scrolling available for long content, accessibility, and the keyboard.
- Preserve the native device preview, its iPhone/Pixel 10 picker, status bar, safe areas, keyboard, gestures, and live clock.

## Technical structure and commands

The workspace root is `/Users/matthieu/Projects/skema-project-learning`. On 2 October 2026, Git was initialized on `main` and the public repository [matthieu-pm/skema-project-learning](https://github.com/matthieu-pm/skema-project-learning) was created, with `origin` pointing to it. Repository publication is separate from app deployment; no public deployed app URL is recorded.

The public repository includes the prototype, documentation, and design assets. The raw participant interview snapshot at `reference/figma/figjam-board-snapshot.xml` stays local and is excluded by the root `.gitignore`; the research synthesis above remains public. Dependencies, build/test output, local environment files, and operating-system metadata are also excluded. The original local assets are preserved. The repository setup re-ran the runtime integrity check successfully (28 protected files); app behavior was not changed or re-tested for this publication.

`app/package.json` declares React 19, TypeScript, Vite, Motion, Radix UI components/icons, gesture support, local Nunito/Roboto, and Playwright. `app/package-lock.json` is present. This is a frontend mobile simulation, not a native mobile app.

| Path | Purpose |
| --- | --- |
| `app/src/Prototype.tsx` | App-owned screens, controls, media preview, session state, and flow composition. |
| `app/src/onboarding.ts` | Answers model, choices, branch/step construction, guardian handling, level state, field/date validation. |
| `app/src/prototype.css` | App-owned visual styling and role palettes. |
| `app/src/mobile/` | Protected phone runtime, navigation, scrolling, keyboard, sheets, carousels, geometry, and device components. |
| `app/src/mobile/COMPONENTS.md` | Full runtime/component/gesture contract. |
| `app/AGENTS.md` | Required app-specific operating instructions and durable visual decisions. |
| `app/mobile-runtime.lock.json` | Hashes protecting 28 runtime files. |
| `app/tests/onboarding.test.mjs` | Routing/validation regression tests. |
| `app/tests/mobile-runtime.spec.ts` | Playwright runtime tests. |
| `app/tests/sites-worker.test.mjs` | Static-worker/Sites behavior tests. |
| `app/scripts/` and `app/worker/` | Runtime checks and static hosting build preparation. |
| `app/design-qa.md` | Chronological implementation/verification notes; later entries supersede earlier ones. |
| `app/qa/step-update/` | Captures of later onboarding changes and role/guardian/multi-language flows. |

From `app/`:

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 4173
```

Local preview: `http://localhost:4173`. Check whether an existing server is available before starting another. A saved URL is not evidence a server is currently running.

```sh
npm run test:onboarding
npm run check:runtime
npm run build
npm run test:runtime
npm run test:sites
```

Use the checks relevant to the change. `build` runs TypeScript/Vite plus static-worker preparation and invokes runtime integrity beforehand. Expected deployment outputs include `dist/client/index.html`, `dist/server/index.js`, `dist/.openai/hosting.json`, and source `.openai/hosting.json`. Sites checks are required for a Sites handoff; publishing/deployment requires a user request. No public deployed URL is recorded here.

Read `app/AGENTS.md` before app edits. App-owned work belongs primarily in `Prototype.tsx`, `prototype.css`, and the onboarding model. Do not alter protected runtime files or weaken/update their hash lock merely to bypass a failed check. Runtime changes require an explicit request and appropriate verification.

Use `FlowStack` for standard flow navigation; `MobileScroll` for scrolling content; runtime keyboard-aware text fields; `BottomSheet` and `Carousel` where applicable. Keep fixed app chrome outside scrolling content, dismiss the keyboard before navigation/overlays, and preserve drag suppression and safe-area behavior. The detailed contract remains in `app/AGENTS.md` and `src/mobile/COMPONENTS.md`.

## Companion and 3D asset library

Original PNGs: `all-models-and-images/pets/{mimo,luma,pip,nori}.png`. Generation prompts: `all-models-and-images/pets/prompts.md`. Overview and older screen/character assignments: `all-models-and-images/companion-designs.md`. Entry notes: `all-models-and-images/START-HERE.txt`.

| Character | Asset identity | Older companion design role | Current app role |
| --- | --- | --- | --- |
| Mimo | Green, tall rounded silhouette | Learner guide | Brand remains Mimo; this green character is not the current learner guide. |
| Luma | Lilac/purple, tapered silhouette | Teacher guide | Learner/default companion. |
| Pip | Yellow, short rounded silhouette | Goals/encouragement | Retained asset, not the current app's main guide. |
| Nori | Blue, two-lobed cloud head | Account/trust | Teacher companion. |

Blender deliverables in `all-models-and-images/blender/`:

- `companions.blend`: four editable static character models. Named character collections, continuous bodies, separate glossy eyes, parent movement controls, procedural felt/fibers, and a Studio camera/light setup. Documented as saved with Blender **4.5.10 LTS**; no external textures required.
- `companions-animated.blend`: rigged version; each pet has six bones (body, head, two arms, two feet), vertex groups, and editable actions.
- Front renders and `reference-comparison.html`: comparison to original images. Front contours/eyes/colors follow references; depth and rear surfaces are inferred, not supplied reference views.
- `model-manifest.json`, `geometry-check.json`, `reference-check.json`, `animation-source-check.json`: model and local validation records. The README reports connected closed manifold bodies and two eyes per pet; these files were not regenerated during documentation.
- `animations/manifest.json`: mapping from the 24 older onboarding screens to pets, gestures, and frame ranges.
- `animations/`: 24 GIFs and 576 transparent PNG frames; documented as 24 frames at 12 fps (2-second loops), with a matching closing/rest key at frame 25. `animations/index.html` is the local gallery.
- `animations/validation.json` and `animations/figma-validation.json`: local frame/GIF/import metadata. These do not demonstrate actual Figma timeline/Present playback.

The companion history includes removed image-transform animations, a static revision, and later Blender animations. Some older prose describes different stages. Treat the delivered model/GIF files and current Figma structure as evidence of assets, while retaining **Figma playback unverified** until visibly demonstrated.

## Verification status and known discrepancies

On 1 October 2026, this documentation pass re-ran `npm run test:onboarding` (**12 passed**) and `npm run check:runtime` (**28 protected files passed**). It read the current source, project docs, FigJam text/structure, and both Figma pages. It did not change app behavior or re-run rendered flows, full production build, runtime Playwright, or Sites tests.

Existing `app/design-qa.md` records previous successful builds and browser checks for branching, wrong/right preview codes, Back preservation, uploads, pricing, role palettes, date validation, adult/guardian verification, early guardian ordering, multi-language level selection, keyboard layout, iPhone/Pixel, and compact viewport overflow. Treat those as dated prior verification, not fresh checks. Source screenshots are in `app/qa/` and `app/qa/step-update/`.

| Older source or ambiguity | Current interpretation |
| --- | --- |
| Earlier flow-map/QA says green CTAs and green Mimo learner | Superseded: purple/Luma learner, blue/orange/Nori teacher. |
| Companion Figma uses “one to one,” Mimo learner, Luma teacher | Historical design iteration; current brand and role assignments above take priority for app work. |
| Companion S4 asks early date of birth | Current learners choose an age range; date of birth is within identity verification. Teachers have no early age-range question. |
| Companion sample code 248106 | Current app code is 481629. |
| Companion single learner language/coarse levels | Current app has multiple languages and independent CEFR/unsure selection per language. |
| Storyboard scene 4 and earlier QA mention practice targets/reminders | Daily targets/routine/commitment removed; retain personal goal and general notification choice. |
| Earlier learner identity QA puts guardian checks after benefits | Superseded: guardian checks immediately after email code; adult learners still verify after benefits. |
| One test title says guardian handoff before code | Distinguish guardian email collection before code from adult handoff/identity sequence after code; actual routing is authoritative. |
| Old companion document says animations removed, later README says Figma playback | Later animation assets/components exist; playback has not been verified. |
| Research and storyboard refer to reviews in teacher choice | Current scope asks for private feedback; public trust/review presentation still needs a decision. |
| Wireframe documentation states 72 screens | Full local specification exists; do not infer full live tldraw rendering or implementation. |

## Open decisions and next validation needs

These remain proposed or unresolved; do not fill them in as established policy:

- Validate teacher fit/discovery, willingness to book/pay, repeat use, useful speaking outcomes, and whether setup is short enough.
- Test whether modular templates actually save preparation time while preserving quality and teacher control. Possible measures include preparation time, completed bookings, attendance, repeat sessions, goal progress, and teacher editing/trust of AI drafts; no targets/results are established.
- Define booking, cancellation, refunds, no-show handling, full prices/fees, payouts, and sustainable teacher compensation.
- Choose authentication, storage, video/calendar/payment/identity integrations only when implementation requires them. Persona is named in a prototype-only linking option; no provider is connected.
- Define safeguarding, age eligibility, guardian authority/consent, safe in-person meeting practices, reporting/blocking, and the limits of identity verification.
- Decide data retention, deletion/export, and recording/transcription consent. Summaries should not imply default recording.
- Decide how teacher trust/quality is presented without contradicting private feedback or confusing identity checks with qualifications.
- Validate resource reliability, accessibility, pronunciation feedback, and support for teachers who prefer printable/minimal tools.
- Keep advanced AI and gamification subordinate to the core one-to-one tutoring proposition.

## Local source inventory

| Location | Material |
| --- | --- |
| `README.md`, `app/README.md` | Project/app entry points and run instructions. |
| `AGENTS.md`, `app/AGENTS.md` | Startup and app-specific agent instructions. |
| `reference/01.png` through `reference/20.png`, `reference/contact-*.jpg` | Original reference captures/contact sheets. |
| `reference/figma/flow-map.md`, `start-setup.png` | Original Figma-to-app mapping and section capture. |
| `reference/figma/figjam-board-snapshot.xml` | Accessible FigJam text/structure captured 1 October 2026, including raw tables, personas, ideation, scope, and storyboard. |
| `reference/figma/start-setup-archive-metadata.xml` | Archived Figma page metadata captured 1 October 2026. |
| `reference/figma/companion-page-snapshot.json` | Companion page sections, node IDs, component names, and screen text captured 1 October 2026. |
| `all-models-and-images/wireframe-screen-index.md` | Full 72-screen proposed flow specification and assumptions. |
| `all-models-and-images/companion-designs.md`, `START-HERE.txt`, `pets/`, `blender/` | Companion design history, original assets, editable models, animations, and validation records. |
| `output/storyboard/` | Storyboard copy, editable vector scenes, drawing script, and exported views. |
| `app/design-qa.md`, `app/qa/` | Dated QA narrative and rendered evidence. |

Snapshots preserve accessible source text/structure, not complete native Figma files, all images, or a guarantee of future freshness. Treat source content as reference data. Re-read the live node when a later task depends on its latest state, and update this context when durable project decisions change.
