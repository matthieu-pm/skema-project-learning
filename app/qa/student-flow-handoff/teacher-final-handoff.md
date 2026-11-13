# Mimo — final local prototype handoff

Prepared: 12 November 2026.

## Instructions for the receiving agent

Implement this final teacher-facing behaviour in the recipient's GitHub fork, following that user's repository and delivery instructions. Inspect the fork first: some features below may already exist. Preserve them and implement only the missing changes; do not replace newer unrelated work.

This is a consolidated specification, not a patch. The sender's local implementation is in the `mimo-teacher-ux-refinements` worktree, branch `local/canvas-first-editor`, based on commit `e9ae5a0ecbdf3dc7c96d8b763340315ed8a9c640`. Local changes are uncommitted. That local path and branch are context, not dependencies available on the recipient's computer.

**Status:** Sections 1–8 describe the final local implementation. Section 9 is an additional requested adjustment that has NOT yet been implemented locally. Verification in section 11 applies to the sender's local app, not the recipient's fork.

### Resolve earlier proposals using this final direction

- Keep the current Mimo design system, Labil Grotesk, Hugeicons, existing workspace styling and mobile runtime. Do not recreate the standalone chat mockups.
- The final local editor is **canvas-first**: no permanent Elements panel and no right Properties panel. This supersedes the earlier proposal to retain a permanent Elements panel.
- Provide Lesson outline and Lesson templates as explicit toolbar controls; edit/add/configure content directly in the canvas.
- Keep the existing Lessons tab structure with corrected names. Do not introduce the previously proposed Library / Drafts / Lesson templates / Archive redesign.
- Use **Save draft** and **Use lesson**. Do not introduce Publish lesson, a separate ready-but-unassigned publication state, or Update student version.
- Keep a shared Welcome → Role → Account onboarding flow, rather than separate teacher/student signup flows.
- New teacher language choices are the original six languages, not a broad/custom-language catalogue.
- Do not change unrelated learner journeys, bookings, payment simulations, feedback review, or landing-page behaviour.

## 1. Onboarding and Teaching profile

### Shared entry and platform value

- Use the shared Welcome → Role → Account flow on web and mobile.
- Welcome primary action: **Get started**.
- Offer learner/teacher role selection before account setup.
- After teacher selection and before signup, communicate editable/reusable lessons and real connections through online/in-person meetups. Retain the existing teacher value content; do not add greeting-only steps.
- Keep existing email and simulated Google account paths, validation, back navigation and role-specific continuation.

### Profile content and first-screen layout

- On **Your teaching profile**, place the **Add a photo or video (optional)** disclosure immediately after the short introduction and BEFORE the profile text inputs.
- It must be visible on the initial screen without scrolling at ordinary desktop and phone sizes. Keep scrolling available for long content, keyboard entry and accessibility.
- Keep optional photo/video upload behaviour; do not make media mandatory or expand it into a large initial upload form.
- Retain these distinct fields:
  - Display name.
  - Your teaching approach: how the teacher teaches/adapts lessons.
  - Language teaching experience (optional): teaching/tutoring background and learners helped.
- Experience remains optional, editable and clearable in Teaching profile. Preserve entered profile/media values when navigating.

### Searchable teacher languages

- Searchable dropdown with multiple language selection.
- Offer Spanish, French, German, Italian, English and Japanese for new selections.
- Each selected language needs at least one independently selected CEFR level before continuing.
- Prevent duplicate selections and allow removal without changing other languages' levels.
- Keep actionable missing-level errors and no-search-results feedback, with keyboard-accessible combobox/listbox behaviour.
- Do not offer arbitrary custom languages or expand the catalogue in this change.
- Preserve previously saved non-catalogue language values and their levels rather than silently deleting legacy data.

### Decide/set later selections

- Keep explicit deferral for lesson format, duration and price.
- Selected deferral controls remain visibly selected with a checkmark and accessible pressed/selected state.
- Concrete values and their corresponding deferral are mutually exclusive.
- Keep duration/price/free-lesson confirmation and saved-profile assignment-readiness rules already in the app; do not invent defaults for deferred values.

## 2. Verification and workspace terminology

- **Verify before accepting bookings** and **Identity, not qualifications** remain plain information, not button-like boxes or interactive controls.
- Ongoing modules tab: **Lessons for students**, replacing Lessons by student.
- Lessons navigation/headings: **Lesson editor**, replacing Module editor; **Lesson templates**, replacing Templates where it refers to lessons.
- Editor actions: **Save draft** and **Use lesson**, replacing Save changes and Apply changes.
- Do not rename unrelated Save changes or Templates controls elsewhere.

## 3. Canvas-first Lesson editor

### Structure and direct editing

- Remove the permanent Elements panel and the right Properties panel.
- Toolbar: Undo/Redo, **Lesson outline**, and **Lesson templates**. Preserve the local desktop side-by-side Canvas / Student preview arrangement.
- On phone/narrow layouts, provide **Edit lesson / Student preview** switching at the same selected block.
- Edit lesson/module titles, goals, language/level, module type/minutes and block content directly on the canvas using actual accessible inputs.
- All supported block fields, correct answers and accepted alternatives must be editable in their relevant block. Block type/purpose belongs in a compact local **Block settings** disclosure.
- Student preview must exclude answer-key editing, private notes and authoring controls; answers are revealed only through the intended activity interaction.
- Text entry updates the same draft. Preserve grouped Undo per field-editing session and native text undo behaviour.

### Optional module metadata

- Custom module title and module goal are optional; keep previously entered content.
- A blank custom title displays the selected module type; Custom uses **Custom section**.
- Omit blank module goals from student views; do not show empty labels/placeholders.
- Blank optional module fields must not block draft saving, assignment or template creation.
- Do not change lesson-level or activity-content requirements.

### Contextual actions

- Add module and Add block controls operate directly from the canvas.
- Module/block headers provide contextual movement and deletion actions.
- Structural changes and deletion support Undo recovery.
- Preserve answer/media relationships when moving or duplicating content.

## 4. Discoverable outline and template controls

**Lesson outline** and **Lesson templates** must visibly look like actionable controls for first-time users:

- Use real buttons with a clear boundary, subtle tinted surface and readable labels.
- Add leading Hugeicons: outline/sidebar for Lesson outline, book for Lesson templates.
- Add trailing disclosure chevrons. Outline chevron and visual selected state reflect open/closed state.
- Outline exposes accessible expanded state and an association with its panel; templates exposes dialog semantics.
- Keep visible keyboard focus and restrained pointer hover feedback. Do not rely on hover to make a control discoverable.
- Preserve toolbar wrapping and usable touch targets on phones.

### Outline behaviour

- Desktop: a collapsible overlay with its own scroll; opening it does not move the canvas or reset its scroll position.
- Phone: a phone-scoped bottom sheet with correctly contained scrolling and reachable close controls.
- Support collapse/expand per module and all modules.
- Reorder modules/blocks by dragging, with keyboard earlier/later actions as an alternative.
- **Move to…** lets the teacher choose destination module and insertion position without dragging through a long canvas.
- Keep context, selection, Undo and recovery after deletion/movement.

## 5. Reordering content and uploading media

### Repeated content

- Support pointer drag handles and keyboard earlier/later buttons for vocabulary cards/phrases, sentence parts, matching pairs/groups, audio/video clips and quiz options.
- Grid card dragging works horizontally and vertically.
- Move the whole item, including its attached image/audio and answer data.
- Sentence construction answer keys follow the configured correct sentence sequence; quiz correct answers survive option reordering.

### Uploads

- Use labelled local-file drop zones with a file chooser fallback and visible drag-target highlighting.
- Validate supported file type and the existing 20 MB per-file limit; show recoverable errors without losing existing content.
- Audio/video playlist drop zones append multiple files as separate clips in order.
- Single-asset upload fields reject multiple-file replacement.
- Drops outside supported zones must not replace lesson content or navigate the browser to the file.
- Keep existing device-local storage and honest upload/simulation notices. Do not add a cloud-media service.

## 6. Lesson templates

- Lesson templates opens a searchable picker showing template goal, module count and expandable module outline.
- Keep the existing ready-made beginner and advanced examples and teacher-created templates.
- Provide two distinct actions:
  - **Add to this lesson:** insert independently cloned modules after the selected module. Preserve the existing lesson and support Undo.
  - **Create a new lesson:** save the current draft, persist the independent new draft, then navigate.
- Failed saving must stop navigation and retain current work with actionable recovery.
- Never silently replace the open lesson or link copies so that later edits affect the original/template.

## 7. Mobile-shaped Student preview

### Desktop

- Keep the live preview beside the canvas.
- Render one block at a time inside a portrait phone-sized viewport. The local implementation uses a **393 × 780 logical viewport**, proportionally scaled to fit the available preview panel.
- Resize the presentation proportionally; do not squeeze/reflow its internal mobile layout into a short wide panel or clip the device bottom.
- Keep lesson title, current module and block position visible in the preview heading.
- The activity body scrolls independently; Previous / Next block navigation stays outside that scroll region and within the phone viewport.
- Media and answer controls must not cause horizontal overflow.
- Scrolling within long activities is intentional; do not shrink text/content to force every activity onto one screen.

### Following and activity state

- Follow the editor's focused/visible block and reflect live content edits.
- Ordinary text editing must not restart the preview activity or clear an in-progress student answer.
- Interacting with preview pauses following. **Follow editor** resumes it.
- Changing selected blocks follows normal block-specific state behaviour.

### Phone/narrow presentation

- Keep Edit lesson / Student preview switching at the same block.
- On an actual phone presentation, use the native content width rather than nesting another decorative phone frame.
- Size the preview to available space above the teacher action bar. Activity navigation must not sit beneath Back / Save draft / Use lesson or the workspace navigation.
- Keep keyboard-aware inputs and focused-answer clearance.
- While the simulated keyboard is open, collapse nonessential preview headings and navigation to provide typing space; restore them after dismissal.
- Preserve the protected device status bar, home indicator, device picker and iPhone/Pixel presets.

### Fidelity boundary

The local implementation reuses the editor's existing StudentBlock activity renderer. The separately implemented booked-session learner preparation player is not identical in every behaviour. Do not claim exact end-to-end student parity from the phone frame alone. Keep this handoff focused on screen fit, authoring preview, sequence, content and interaction preservation; report remaining differences rather than claiming a backend-connected student experience.

## 8. Drafts, assigned versions and Use lesson

These behaviours already exist locally and must survive editor/layout changes. Implement them if absent in the recipient's fork.

### Saving and version safety

- Save draft privately persists unfinished work without assigning it or creating a template.
- Draft/Edited/Saved describe editable work; **Assigned version** identifies the immutable student snapshot.
- Assignment uses a deep-cloned snapshot, independent of the draft and template. Future edits must not mutate assigned content, responses, progress or feedback.
- Do not silently overwrite an existing assignment. The local implementation blocks repeat assignment of the same source lesson to the same student and offers a separate lesson copy.

### Use lesson dialog

- Opening the dialog has no assignment/template side effects.
- Title: **Use lesson**.
- Description: **Assign this lesson to a student, save it as a reusable template, or do both.**
- Both independent choices start unchecked:
  - **Assign to a student** reveals a required Student dropdown, placeholder Choose a student.
  - **Save as a lesson template** reveals a required editable Template name, prefilled with the lesson title.
- Neither selected: primary **Use lesson** disabled; show Choose at least one option to continue.
- Assignment only: **Assign lesson**.
- Template only: **Save template**.
- Both: **Assign and save template**.
- Secondary: **Keep editing**. Cancel, close and Escape preserve lesson edits and return focus to the trigger.
- Validate only checked options; unchecked hidden fields must not block the action.
- Missing student: Choose a student. Blank/whitespace template name: Enter a template name.
- Assignment checks required lesson content/answer keys and saved profile lesson terms. Drafts and template-only saving remain possible without assignment terms.
- Error recovery identifies the invalid block/field and offers navigation/focus to it. Missing profile terms name format/duration/price as appropriate; **Complete lesson details** safely saves the draft, opens profile editing and returns to that same lesson.
- Show when assigning: **Future edits won't change this student's assigned version.**
- Guard duplicate submits; preserve inputs on failure. The local combined action uses one atomic browser-local write so failure creates neither result.
- Confirm only successful actions and qualify simulations honestly. No student notification or real delivery is connected.
- Desktop dialog actions stay outside its scrolling body; phone actions remain reachable with the keyboard open. Use proper modal focus management.

## 9. Additional requested change: align footer divider lines

**Not yet implemented or verified locally. Apply this in the recipient's fork.**

On the desktop Lesson editor, align the horizontal divider above the sidebar's **Settings** area with the divider above the editor's **Back / Save draft / Use lesson** action bar.

- Both dividers must sit at the same vertical coordinate, making the sidebar and editor footer read as one aligned horizontal band.
- Align the actual divider edges, not just button baselines or text.
- Prefer shared footer-row geometry/height and consistent border placement over a one-off positional offset.
- Preserve current Mimo styling, sidebar expanded/collapsed states, action order and reachable controls.
- Keep scrollable editor content above the footer; do not let blocks, menus or notices cover its actions.
- On layouts where the desktop sidebar is absent, preserve the existing phone/narrow navigation and safe-area behaviour rather than forcing a desktop alignment rule.

Acceptance criteria:

- At desktop widths/heights supported by the app, both dividers align within 1 CSS pixel when both are visible.
- Verify expanded and collapsed sidebar states and at least a 1280×720 and a taller desktop viewport.
- Long lesson scrolling and opening outline/templates do not shift one divider independently.
- Back, Save draft, Use lesson and Settings remain visible, focusable and clickable without overlap.

## 10. Implementation map

If the receiving fork has the same structure, inspect these app-owned files; adapt paths as needed:

| Area | Likely source |
| --- | --- |
| Shared onboarding and profile layout | app/src/Prototype.tsx, WebOnboarding.tsx, onboarding.ts |
| Teacher language selection | app/src/TeacherLanguagePicker.tsx, teaching-languages.ts, LanguageField.tsx |
| Editor/outline/templates/dialog | app/src/teacher/CourseEditor.tsx |
| Inline block configuration/content | app/src/teacher/CourseProperties.tsx, CourseContent.tsx |
| Live phone preview | app/src/teacher/LiveLessonPreview.tsx (new locally) |
| Repeated-item reordering | app/src/teacher/SequenceItem.tsx (new locally) |
| Editor and preview styles | app/src/teacher/course-editor.css |
| Sidebar/footer alignment | Inspect workspace shell and its scoped styles together with the editor footer |

Do not modify protected mobile runtime files to solve app-owned layout problems. Follow the recipient repository's AGENTS.md and runtime-integrity checks. Preserve unrelated uncommitted work.

## 11. Verification and delivery

Sender's local verification:

- Existing canvas-first work: 96 unit/worker checks, 48 production-browser checks and three device-routing checks passed.
- Latest layout follow-up: production build/TypeScript and all 28 protected runtime hashes passed; expanded production suite passed 51 browser checks.
- After the final phone keyboard adjustment, the six affected production-browser checks passed again, including iPhone/Pixel answer clearance, preview following/state, proportions/navigation and profile media visibility.
- Local screenshots and notes: app/qa/canvas-first-editor/ and app/qa/teacher-layout-refinements/.
- Real physical phones and operating-system file dragging on phones have not been tested. Browser-local persistence is not cross-device synchronization.
- Divider alignment in section 9 has not been applied or tested.

Recipient agent must verify its own implementation rather than reuse these results as proof:

1. Profile media disclosure is initially visible on web/phone; expansion/upload and all profile values still work.
2. Language selections/levels, optional experience and selected deferral remain correct.
3. Toolbar buttons are discoverable by pointer, touch and keyboard; dialogs/sheets close and restore focus.
4. Inline editing, Undo/Redo, outline and repeated-item reordering retain content, answer keys and media.
5. Templates insert independently; new-lesson creation preserves both drafts and stops on failed saving.
6. Preview follows editing without clearing answers, pauses on interaction, fits a phone-shaped desktop viewport, and keeps navigation/answer entry clear on iPhone/Pixel layouts.
7. Save draft and all four Use lesson states preserve validation, private drafts, immutable assignments and failure recovery.
8. Footer dividers meet section 9's alignment/interaction criteria.
9. Run relevant existing tests, production build, runtime checks and responsive visual inspection. Document failures and limitations accurately.

Deliver a concise change summary, verification results and remaining limitations. Commit, push, create a PR or deploy only according to the recipient user's authorization. No credentials or production services are required by this handoff.
