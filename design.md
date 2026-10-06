---
name: mimo-design-guidelines
description: "Design, build, or improve Mimo's mobile language-tutoring experience. Use for onboarding, learner and teacher flows, companion artwork, controls, and proposed screens that need Mimo's Labil Grotesk typography, role palettes, raised surfaces, human guidance, and mobile interaction conventions."
---

# Design the Mimo app

Shape the task, language, and interface together. Help someone take one clear step toward learning with a teacher or preparing to teach. Make Mimo feel warm, capable, reassuring, and manageable through clear choices, readable content, and responsive controls.

This guide adapts the supplied brand-guidelines example to Mimo. It documents the existing visual foundation and gives direction for future work. It does not introduce a new theme, runtime, or product scope.

The separately requested **6 October 2026 landing page** at `app/public/landing/index.html` uses Clay's go-to-market website as a marketing-layout reference: pale grids, spacious headings, and layered product illustrations, adapted with Nunito and Mimo's original companions. This is a companion website, not a replacement for the mobile experience. It uses darker purple `#7640B5` for readable web CTAs; onboarding colors are unchanged. Interactive learning-goal examples are illustrations, and all entry CTAs lead to the existing onboarding welcome. See `context.md` for references and verification.

**Superseding landing direction from the user's later screenshot:** closely follow Clay's landscape-first homepage structure: generated 3D scenery, emerald hero band, compact floating navigation, overlapping intro panel, spacious product preview, and four large pastel feature panels. Use official Hugeicons for UI icons and original generated imagery for website backgrounds and feature illustrations. The landing now uses emerald, cream, yellow, and panel-specific web actions rather than the initial purple CTA palette. Preserve Nunito, product scope, original companion identity, and the existing phone app. The screenshot drives website composition only; do not copy Clay claims, customer logos, or its actual artwork.

**Current landing refinement:** Labil Grotesk supersedes Nunito on the website and, following the later prototype request, in app-owned phone content. Use compact 36px actions, 32px navigation actions, 14px button corners, and a navigation island attached to the top edge. The phone runtime retains its platform-specific device chrome typography. Preview copy must describe available setup and label lesson/teacher tools as examples or planned.

## Product and brand context

Mimo is a mobile concept for one-to-one language tutoring with a teacher chosen by the learner, online or in person. Practical conversation, useful feedback, and the relationship between learner and teacher are central.

Learners need a comfortable starting point, a meaningful personal goal, and control over whom they learn with. Teachers need to explain their approach and prepare short, reusable, editable lessons with less administration. Guardians need clear handoffs and an honest explanation of what a preview does.

The interface should encourage without pressure. Playfulness belongs in the companions, rounded typography, and tactile controls. Treat adult learners and teachers with respect; avoid childish praise, guilt, competitive pressure, or promises of effortless fluency.

Protect these product boundaries:

- One chosen teacher and one learner per session. No forced matching or group sessions.
- Short, practical, editable lessons. No long-form course authoring by default.
- Optional AI assistance with teacher editing and final judgment. No automatic publication or evaluation claims.
- Private feedback and progress. No social feeds, public leaderboards, friend-following, mandatory daily actions, or streak commitments.
- Flexible preferences and explicit defer actions where the flow supports them.

## Read the sources in order

1. Follow the user's latest explicit decisions.
2. Read [context.md](context.md), including its current-versus-historical discrepancies.
3. Read [app/AGENTS.md](app/AGENTS.md) in full before app work. It owns runtime constraints and durable app decisions.
4. Inspect [Prototype.tsx](app/src/Prototype.tsx), [onboarding.ts](app/src/onboarding.ts), and [prototype.css](app/src/prototype.css) for current components, routing, validation, and styles. Read the complete CSS cascade; earlier selectors can be superseded below.
5. Use the [Figma library handoff](output/design-system/README.md) and [library cover](https://www.figma.com/design/w4nc4L3hNF63uh2HBX9Np5?node-id=101-248) for component specimens and documented additions.
6. Use older Figma, FigJam, storyboard, and wireframe material for its stated content and research purpose. Check its status before adopting a palette, character assignment, policy, or flow.

This document complements those sources. If it drifts from implementation or a newer decision, resolve the difference and update the documentation rather than silently treating it as a second source of truth.

## Separate current behavior from future design

| Status | What it covers |
| --- | --- |
| Implemented frontend prototype | Learner, guardian, and teacher onboarding; local media previews; branch-aware summaries; simulated email, identity, Persona linking, notifications, and widget setup. |
| Designed or proposed | Learning and teaching homes, discovery, booking, payment, lessons, teacher workspace, practice, progress, follow-up, and AI assistance. |
| Library additions | Extended palettes, accessible primary alternatives, status badges, some field states, empty cards, and dialogs. These specimens are not proof of app implementation. |
| Not established | Production authentication, persistence, real verification, safeguarding policy, commercial terms, integrations, dark mode, or verified Figma animation playback. |

Keep preview explanations close to simulated actions. Never imply that an email was sent, an account was connected, consent was recorded, a document was submitted, or a person was verified when the app only changes local state. Identity checks also do not establish teaching qualifications.

## Use this priority order

When requirements compete, protect them in this order:

1. Preserve the requested scope, supplied meaning, user choices, privacy boundaries, and truthful state descriptions.
2. Preserve the phone runtime, routing, keyboard behavior, and existing app conventions.
3. Make the screen's question, available choice, and next action immediately clear.
4. Maintain Mimo's role colors, original companions, Labil Grotesk typography, and raised controls.
5. Refine spacing, density, motion, and responsive behavior without obscuring content or changing unrelated screens.

Use established patterns for routine decisions. Leave unresolved product policy explicitly unresolved. Example prices, cancellation windows, fees, and future services are not commitments.

## Work in four passes

### 1. Frame the person's task

Before changing a screen, establish the role, entry point, decision, required information, optional information, onward route, and Back behavior. Identify the state already available and the state the action changes.

Keep one decision or entry action per onboarding screen. Multiple selections can answer one question, such as which languages someone learns. A language's level is a separate question, repeated for each selected language.

Write the primary action and its outcome before decorating the screen. If the action depends on an external service, distinguish the intended product behavior from the current local preview.

### 2. Compose around the decision

Use the existing onboarding anatomy:

- A fixed Back/progress header where appropriate.
- A companion and short speech prompt, or a focused introduction.
- One coherent content area: choices, a field, media, information, or a summary.
- A fixed primary action, with a quieter defer or alternative action when supported.

Align the prompt, rows, fields, and actions to shared edges. Make true peers share label positions, padding, type treatment, and state geometry. Keep labels and explanations together.

Fit ordinary onboarding above the fixed CTA wherever practical. Reduce unnecessary copy or illustration space before shrinking text. Preserve scrolling for long answers, larger text, and the keyboard. The final item must remain reachable above the footer.

Use centered companion scenes for welcome and brief encouragement. Use aligned rows for choices and left-aligned fields for input. Summaries should help people check their answers; avoid duplicate companion illustrations and repeated explanations.

For future home screens, put the next useful task first: an upcoming lesson or finding a teacher for learners; preparing the next lesson or reviewing learner work for teachers. These are proposed patterns, not implemented navigation.

### 3. Apply the Mimo visual system

#### Brand and companions

Keep the product name **Mimo**. Use the existing wordmark treatment in Labil Grotesk. The product and the older green companion share a name; they are distinct.

| Companion | Appearance | Current use |
| --- | --- | --- |
| Luma | Purple/lilac | Shared welcome, learner, and guardian flows. |
| Nori | Blue | Teacher flows. |
| Mimo | Green | Retained library asset; no current app role assignment. |
| Pip | Yellow | Retained library asset; no current app role assignment. |

Use original artwork from [all-models-and-images/pets](all-models-and-images/pets/) and the app copies in [app/public/assets/onboarding](app/public/assets/onboarding/). Preserve silhouette, color, proportions, transparency, and expression. Use `object-fit: contain`; do not stretch or crop the companion to fill a slot.

Use `luma-coming-soon.png` for the language announcement's lookout pose. Keep that card non-selectable, lavender, rounded, and raised, with no decorative star. Other screens retain the original Luma asset.

The widget preview uses Luma saying “You've got this!” with no day count. Keep the supplied Persona logo within the clearly labeled sample-link flow. Neither asset implies a connected service.

#### Color and role states

These values describe the current app CSS. They are not a new token package.

| Role | Learner/default | Teacher |
| --- | --- | --- |
| Primary fill, `--primary` | `#9955E8` | `#1CB0F6` |
| Primary raised edge, `--primary-shadow` | `#773BC2` | `#1899D6` |
| Selected choice fill | `#E1F5FF` | `#FFF1DB` |
| Selected choice border | `#84D8EF` | `#FFB65C` |
| Selected choice text | `#1899BD` | `#B85C00` |
| Selected checkbox fill | `#1CB0F6` | `#FF9600` |
| Focused field fill | `#F2FBFF` | `#FFF9EF` |
| Focused field border | `#84D8EF` | `#FFB65C` |

Shared app values are `--paper: #FFFDFF`, `--ink: #4B4B4B`, and `--line: #E5E5E5`. The prototype root and default runtime screen remain white. Errors use `#D33131`; note surfaces use `#F5F5F5`. Supporting copy commonly uses `#777777`.

Purple and blue identify primary action and role; selection also has its own palette. Use a checkmark, label, or other visible state cue alongside color, and expose selection programmatically. Do not use the teacher's orange selection to imply an error or warning.

Preserve the current light appearance. Dark mode is not implemented. Designing it would require a complete treatment of content, artwork, controls, and states rather than an automatic inversion.

The existing bright buttons have known contrast limitations. The library records white on learner purple at approximately 4.36:1 and white on teacher blue at 2.44:1. Proposed darker alternatives are learner `#773BC2` and teacher `#08658F`; they are not applied in the app. Treat accessibility compliance as work to verify, not a claim conferred by using these colors. For an accessibility change, test the affected text and states and document the adopted palette.

#### Typography

Use locally bundled **Labil Grotesk** for app content, including controls and text fields. The upright variable font is shared with the landing page at `app/public/landing/fonts/LabilGroteskVariable-Upright.ttf`, declared for weights 100–900; existing UI weights remain 400, 700, 800, and 900. Preserve the platform typography of device chrome; it belongs to the runtime.

| Existing role | Typical treatment |
| --- | --- |
| Welcome wordmark | 43px, weight 900, line-height 1, tight tracking. |
| Section and summary heading | 22px, weight 900. |
| Companion prompt | 18px, line-height 1.45. |
| Choice title | 17–18px, weight 900, compact leading. |
| Field label | 17px, weight 800. |
| Field entry | 18px, weight 400, line-height 1.4. |
| Body and explanation | 16–17px, usually line-height 1.4–1.5. |
| Compact choice detail | 14–15px; preserve readability. |
| Primary/secondary CTA | 15px, weight 900, uppercase via CSS, 0.7px tracking. |
| Preview note | 13px, line-height 1.5; never use this as the only explanation of a consequential action. |

Use sentence case for headings and prose. Existing uppercase CTA styling is intentional; do not extend it to decorative eyebrows or every label. Equivalent options use equivalent type sizes even when one string is longer. Improve wording or wrapping before reducing an individual label's size.

#### Spacing, shape, and depth

Preserve the compact single-column mobile layout. Existing content uses 16px horizontal padding, 8px gaps in dense language/level lists, and roughly 12px gaps in ordinary option groups. Label-to-field spacing is 10px; major field groups commonly have 22px below them. These are reference values from the current CSS, not a rigid global spacing scale.

Use approximately 13px radii for choices, buttons, and fields; 12px for speech bubbles; 16px for summaries. Keep nested shapes visually coherent without adding extra bordered containers.

Raised depth is part of Mimo's interaction language:

- Choice rows and fields use 2px borders with a 4px bottom edge.
- Primary buttons use a 4px solid shadow in the role's primary-shadow color.
- Primary buttons are currently 49px high; ordinary fields have a 56px minimum height.
- Compact language rows use a 52px minimum height, and compact level rows use 58px.

Use the established component geometry before adding new values. Allow height to grow for accessible text and longer content. Do not turn compact reference dimensions into clipping constraints.

Reserve raised surfaces for controls and meaningful information groups. Avoid nested cards, glass effects, decorative gradients, background blobs, ornamental shadows, and oversized hero panels. The existing tactile edge and soft companion artwork provide sufficient character.

#### Controls and feedback

Give each screen one visually dominant action. Keep defer actions visible and quieter, with clear labels such as “Not now,” “Skip for now,” or “Finish this later.” Make the selected state distinct from the momentary pressed state.

Choice press feedback uses a 2px vertical transform. The primary button moves 3px and reduces its shadow to 1px while pressed. Keep borders, margins, dimensions, and sibling positions stable. Release press feedback after the click. Keyboard focus retains the raised edge and has its own visible outline.

Use visible field labels and appropriate keyboard types. Explain errors in plain language near the relevant input; retain what the person entered so they can correct it. Keep disabled states visually distinct without making color the only explanation of why a required action is unavailable.

For uploads, show the selected file, allow replacement/removal, and explain that it stays in the local preview. The current limit is 20 MB. Do not turn a local attachment into a claim that a teacher or server received it.

#### Writing and tone

Ask a concrete question and make the next step easy to predict. Keep prompts short enough for the speech bubble and put essential instructions next to the control. Explain unfamiliar language-level labels where they appear.

Use warm, direct language: “Which languages would you like to learn?” or “What’s one thing you’d love to do?” Keep teacher language equally respectful: “Your teaching. Your own style.”

Avoid em dashes, marketing superlatives, technical implementation language, fabricated urgency, guilt, and guaranteed results. A companion can reassure; it should not judge someone for skipping or returning later. Use honest preview wording such as “Link sample Persona ID” and “Finish verification preview.”

#### Motion and media

Use motion to explain navigation, selection, progress, and a completed press. Current primary-button feedback uses a 100ms ease-out transition. Preserve the runtime's navigation and gesture behavior rather than introducing another motion system.

Honor reduced-motion preferences. Keep the experience understandable without animation. Never delay input behind a companion performance or add looping celebration, decorative pulsing, parallax, or auto-scrolling content.

Reuse source flags, installed icons, and companion artwork. Match icon size and alignment to the control's purpose. Give meaningful images text alternatives and mark purely decorative imagery accordingly. Keep images non-draggable inside the phone.

Blender/GIF assets and static Figma specimens do not establish working in-app animation. Verify actual playback before describing motion as implemented.

### 4. Inspect and revise the actual result

For UI changes, render the app and inspect the changed flow on both iPhone and Pixel 10. Check ordinary screens, keyboard-open states, long content, selected/pressed/focused states, and the final item above fixed actions. For documentation-only work, verify source accuracy and links; do not imply a new rendered-flow review occurred.

Review in this order:

1. **Task:** Is the question clear, and does the primary action lead to the correct role and branch?
2. **Truth:** Do the screen and completion state accurately describe local preview behavior?
3. **Hierarchy:** Is there one clear decision, with supporting content kept subordinate?
4. **Consistency:** Do role palette, companion, type, row alignment, and depth match the existing app?
5. **Interaction:** Do Back, selection, validation, defer actions, uploads, and keyboard dismissal behave correctly?
6. **Fit:** Can the person reach every control without content hiding under the keyboard, header, or footer?
7. **Access:** Are labels, semantics, focus, contrast, touch targets, text scaling, and reduced motion usable?

Fix the highest-impact issue and inspect again. Report actual checks and remaining limitations briefly. Source inspection, screenshots, integrity checks, and interaction tests establish different things; do not substitute one for another.

## Integrate with the existing app

Keep app-specific UI in [Prototype.tsx](app/src/Prototype.tsx) and [prototype.css](app/src/prototype.css), with flow/state logic in [onboarding.ts](app/src/onboarding.ts). Reuse the existing `Mascot`, `Bubble`, `Choice`, `Note`, `Field`, `Upload`, `Header`, and `Footer` helpers where appropriate. These are local implementation helpers, not a published component package.

Use `.learning-app.updated-onboarding` as the existing app context and `.teacher-theme` for the teacher palette. Reuse `--paper`, `--primary`, `--primary-shadow`, `--ink`, `--line`, and `--blue` for their existing roles. The [exported token CSS](output/design-system/tokens.css) is a handoff artifact and is not imported by the app. Do not assume exported library names are live runtime tokens.

In Figma, select the appropriate Role variant as well as the semantic mode. Explicit component modes can override a parent frame's mode. Preserve labels identifying proposed additions.

Follow [app/AGENTS.md](app/AGENTS.md) and [the runtime component contract](app/src/mobile/COMPONENTS.md):

- Preserve the phone frame, device picker, live status bar, safe areas, keyboard, and gestures. Protected runtime changes require an explicit request.
- Use `FlowStack`/`FlowScreen` for conventional flows and `MobileScroll` for scrolling content. Keep fixed app chrome outside scroll content.
- Put route-owned fixed header/footer content in the corresponding `FlowScreen` slots. The current header height is 54px; runtime safe-area handling adds device insets.
- Reserve enough scrollable bottom space for the overlaid footer. The current content uses `calc(var(--flow-footer-height) + var(--mobile-safe-area-height) + 24px)`.
- Use `KeyboardInput`, `KeyboardTextarea`, or `MobileTextField` for text entry. Preserve the native file picker for attachments.
- Use `useKeyboardInsets().bottomInset` for custom keyboard-attached chrome. Do not double-count keyboard height inside `MobileScroll`.
- Dismiss the keyboard before navigation, overlays, and closing attached input surfaces. Existing `FlowStack` and `BottomSheet` handle their own transitions.
- Use `BottomSheet` for phone-scoped sheets and `Carousel` for horizontal collections. Preserve drag suppression; dragging must not activate a control.

## Preserve flow-specific decisions

- Learners can select multiple languages, with an independent level per language. Deselecting a language clears that language's level. The learner language screen has no search; teacher language selection is searchable.
- Learners choose an age range. Under-18 learners provide a guardian email before code entry; the guardian handoff and adult identity preview occur immediately after successful code entry, before language selection.
- Adult learners reach the identity preview after benefits. Teachers skip early age/guardian questions and provide date of birth within identity preview, after legal name.
- Guardian completion or deferral resumes at language selection. Do not repeat verification after benefits or invent a minimum teaching age.
- Online meeting preferences skip city. Preserve the existing defer options.
- Keep the personal learning objective, general notification choice, and optional widget preview. Do not restore daily-minute, routine, commitment, streak, or subscription screens from historical material.
- Back preserves answers during the current session. Replay and reload reset the prototype; do not describe it as durable account storage.
- Completion remains an onboarding endpoint, not a working discovery or teacher dashboard.

Consult the routing source for exact behavior rather than copying a historical screen sequence.

## Reject patterns that weaken Mimo

Do not ship:

- A generic landing page or desktop dashboard in place of the phone experience.
- Geist typography, Vercel branding, report grids, or `vbg-*` classes copied from the example.
- Swapped companions or historical green learner styling.
- Extra decisions, duplicate illustrations, or ornamental cards added merely to fill space.
- Tiny text, clipped answers, or hidden scrolling used to make a screenshot fit.
- Focus that appears permanently pressed, or press feedback that shifts neighboring rows.
- A decorative progress indicator unrelated to the actual branch.
- Claims of verified identity, sent invitations, saved accounts, or connected services based on local state.
- Forced matching, public competition, daily obligations, or AI that removes teacher control.
- Assumed production policy drawn from illustrative prices or research ideas.

Keep Mimo distinctive through its companions, tactile controls, humane language, and clear choices.

## Verification and maintenance

Run `npm --prefix app run check:runtime` before handoff. For flow changes, run `npm --prefix app run test:onboarding`; for implementation changes, run the build and the relevant browser/runtime checks required by [app/AGENTS.md](app/AGENTS.md). Integrity checks protect runtime files; they do not prove usability or correct routing.

When durable behavior or design decisions change, update [context.md](context.md) and this guide. Record durable prototype feedback in [app/AGENTS.md](app/AGENTS.md). Preserve original research/design assets and unrelated work. Keep raw participant material out of public documentation.

Source basis: local app implementation, app instructions, project context, and design-system handoff reviewed on **4 October 2026**. This guide is a documentation addition; it does not certify accessibility, revalidate historical browser checks, or implement proposed features.
