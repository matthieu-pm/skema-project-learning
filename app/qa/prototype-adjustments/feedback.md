# Mimo prototype adjustments — implementation handoff

## Purpose and scope

Implement the changes below in the Mimo language-learning prototype. Preserve the existing Mimo design system, responsive layouts, navigation, and unrelated functionality. Adapt to the current repository structure; do not assume specific filenames.

This document is a specification, not evidence that any changes have been implemented. Creating this handoff does not authorize the authoring agent to edit, commit, push, or deploy the prototype. The receiving agent should follow its user's implementation and delivery instructions.

Do not include other proposals from earlier discussions unless specified below. In particular, moving the properties panel into the canvas and redesigning the Lessons tabs to Library / Drafts / Lesson templates / Archive are outside this handoff's scope.

## 1. Onboarding

### 1.1 Communicate platform value before sign-up

Show the platform's value before the teacher begins signing up:

- Create editable, reusable lessons.
- Build real connections with students through in-person or online meetups.

Suggested copy, adaptable to the existing screen:

> Your lessons. Real connections.
>
> Create lessons you can edit and reuse. Connect with students through in-person or online meetups.

Integrate this into an existing entry screen where possible. Do not add another greeting-only screen or lengthen onboarding unnecessarily. Retain a clear sign-up action and access to sign-in.

Acceptance criteria:

- Both benefits are visible before sign-up begins.
- Content fits mobile and desktop without clipping or obscuring actions.
- Existing sign-up and sign-in paths remain functional.

### 1.2 Add language teaching experience to the teacher profile

Allow teachers to describe their language teaching experience. Make it available in the teacher-profile step and editable later in Teaching profile.

Suggested field:

- Label: **Language teaching experience**
- Helper: **Describe your teaching background, the learners you've worked with, and your approach.**
- Input: multiline text.

Implementation assumption: this field is optional because no mandatory requirement was specified. Do not require credentials, documents, or identity verification for this field. Reuse the existing profile persistence mechanism.

Acceptance criteria:

- Teachers can enter, save, revisit, edit, and clear their experience.
- Leaving it blank does not block onboarding.
- Existing profile values remain intact after this field is added.

### 1.3 Searchable, multiple-language selection with levels

Replace the teacher language-selection interface with a searchable dropdown supporting multiple selected languages.

- Teachers can search for and select more than one language.
- Each selected language has its own level selection.
- Every selected language must have at least one level selected before continuing.
- Reuse the current language-level vocabulary and options; do not introduce a new proficiency framework.
- Allow removal of a selected language and editing of its levels.
- Prevent duplicate language selections.
- Clearly display all selected languages and their associated levels.

Validation and empty states:

- Missing levels: **Choose at least one level for [language].** Show this beside the relevant language and direct focus to it when continuation fails.
- Search with no matches: **No languages found. Try another search.** Preserve the search text and current selections.
- Keep the existing minimum-language requirement, if present. At minimum, every language that remains selected must have a level.
- Removing a language removes only that language's associated selections, leaving other languages unchanged.

Acceptance criteria:

- A teacher can select two languages and different levels for each.
- Continuing with any selected language lacking levels is blocked with actionable inline guidance.
- Selections survive back/forward navigation and saving according to the current onboarding persistence behaviour.
- Search and selection work with a keyboard and on mobile; provide accessible labels, focus states, and appropriate combobox/listbox semantics.

### 1.4 Make “Decide later” visibly selected

Where **Decide later** is an existing selectable option, give it a persistent selected appearance after selection, consistent with other selectable options.

- Use more than colour: include a checkmark or another clear selected indicator and expose the selected state accessibly.
- Preserve existing deferral behaviour and validation rules.
- If mutually exclusive with specific choices in the current flow, selecting a specific choice clears Decide later, and vice versa.

Acceptance criteria:

- The teacher can immediately identify that Decide later is selected.
- The selection remains visible after leaving and returning to the step where existing state persistence supports this.

## 2. Profile verification

Render **Verify before accepting bookings** and **Identity, not qualifications** as informational text rather than button-like boxes.

- Remove the enclosing visual treatment that implies the text can be clicked.
- Keep the text readable and in the relevant verification context.
- These informational statements must not be focusable buttons or links.
- Preserve actual verification actions and the underlying verification/booking rules.

Acceptance criteria:

- Neither statement looks or behaves like an interactive control.
- Genuine verification actions remain clearly identifiable and accessible.

## 3. Ongoing modules

Rename the tab **Lessons by student** to **Lessons for students**.

- Preserve its content, routing, selection behaviour, and relationship to the review queue.
- Update the visible label and corresponding accessible name consistently.

## 4. Lessons terminology and editor actions

Apply these user-facing label changes consistently in relevant navigation, headings, breadcrumbs, and accessible names. Internal identifiers and URLs need not change unless required by the implementation.

| Current label | New label |
| --- | --- |
| Module editor | Lesson editor |
| Templates, when referring to lesson templates | Lesson templates |
| Save changes, in the Lesson editor | Save draft |
| Apply changes, in the Lesson editor | Use lesson |

Retain the editor's action order:

**Preview lesson → Save draft → Use lesson**

Do not rename unrelated Save changes or Templates controls elsewhere in the product.

### 4.1 Save draft

- Saves the teacher's current work privately using existing persistence.
- Does not assign a lesson, update an existing student assignment, or create a template.
- Allows unfinished content to be saved; assignment/template validation must not prevent draft saving.
- Confirms successful saving and provides an actionable error if saving fails. Never claim success before persistence succeeds.

### 4.2 Optional module title and goal

- Custom module title and module learning goal are optional.
- Remove required markers and validation that force these fields to be completed.
- Preserve any existing teacher-entered values.
- If a custom title is blank, use the selected module type as its display heading, for example Vocabulary or Listening. For a custom module type, use Custom section.
- Omit an empty module goal from the student view; do not show an empty label or placeholder.
- Blank optional fields must not block saving, assignment, or template creation.
- This does not change requirements for the lesson title, lesson goal, module type, or block content.

## 5. “Use lesson” dialog

### 5.1 Purpose and opening behaviour

Clicking **Use lesson** opens a dialog. Opening it must not assign the lesson or create a template.

- Title: **Use lesson**
- Description: **Assign this lesson to a student, save it as a reusable template, or do both.**

No separate Publish lesson action or ready-but-unassigned publication state is introduced by this handoff.

### 5.2 Independent choices

Start with both choices unchecked. The teacher can select either or both.

**Choice A: Assign to a student**

- Checkbox label: **Assign to a student**
- Helper: **Give a student access to this version of the lesson.**
- When checked, reveal a required dropdown:
  - Label: **Student**
  - Placeholder: **Choose a student**
- Use the existing student data and selection behaviour. Multiple-student assignment is outside this scope.
- When unchecked, hide the student field and do not include an assignment in the submitted action, even if an earlier student selection is retained locally.

**Choice B: Save as a lesson template**

- Checkbox label: **Save as a lesson template**
- Helper: **Create a reusable copy for future lessons.**
- When checked, reveal a required text field:
  - Label: **Template name**
  - Prefill with the current lesson title; allow editing.
- Do not overwrite a teacher-edited template name on incidental re-renders.
- When unchecked, do not create a template, regardless of any retained template-name value.

### 5.3 Footer actions

- Secondary button: **Keep editing**. Close the dialog without applying either action; retain the lesson's edits.
- Close icon: same cancellation behaviour, with accessible name **Close dialog**.
- Primary button depends on the selected options:

| Selection | Primary label | State |
| --- | --- | --- |
| Neither | Use lesson | Disabled |
| Assign only | Assign lesson | Enabled for submission/validation |
| Template only | Save template | Enabled for submission/validation |
| Both | Assign and save template | Enabled for submission/validation |

When neither is selected, display **Choose at least one option to continue.**

Place the secondary action before the primary action, aligned with the existing Mimo dialog conventions. Stack or wrap appropriately on narrow screens.

### 5.4 Validation and readiness

- A saved draft is private and is not an assignment. A teacher can use a completed draft through this dialog only after the relevant readiness checks pass.
- Assigning requires a selected student and completion of the existing lesson-readiness requirements, including required content and answer keys for automatically checked practice blocks.
- Missing student: **Choose a student.**
- Blank template name, including whitespace-only input: **Enter a template name.**
- Surface missing lesson content with specific guidance identifying the affected module/block. Do not use optional module title or goal as a blocker.
- Preserve the existing template-content requirements; do not invent additional template completeness requirements in this change.
- Hidden, unchecked options must not trigger required-field validation.
- Show field errors inline, focus the first relevant error, and retain entered content and selections.

### 5.5 Assigned version safety

When assignment is selected, show:

**Future edits won't change this student's assigned version.**

- Assign a snapshot of the current validated lesson, not a mutable reference to the editor draft.
- Subsequent draft or template edits must not change an existing assignment, its student responses, progress, or feedback.
- Save a separate reusable copy when creating a template.
- Do not introduce an Update student version action or silently replace an existing assignment.
- Preserve any existing duplicate-assignment guard. If none exists, identify this as an implementation decision rather than silently overwriting student work.

### 5.6 Prototype notice

If actions are still simulated/browser-local, retain an honest notice:

**Prototype only. Assignment and template creation are simulated; no student is notified.**

Place it below the choices, with lower visual emphasis than the primary task but readable contrast. Do not imply server persistence or actual student delivery if unavailable. If the receiving application has real actions, use copy that accurately describes its behaviour instead.

### 5.7 Processing, success, and errors

- Prevent duplicate submissions while processing and expose a clear busy state.
- Confirm only actions that succeeded. Suggested success wording:
  - Assignment: **Lesson assigned to [student].**
  - Template: **Lesson template saved.**
  - Both: **Lesson assigned to [student] and saved as a template.**
- For a simulated prototype, qualify the success as simulated rather than implying actual delivery.
- If an action fails, keep the teacher's selections and inputs, explain what failed, and allow retry.
- If combined actions can partially succeed, report the successful and failed actions separately and retry only the failed action. Do not create duplicate assignments/templates.

### 5.8 Accessibility and responsive behaviour

- Use an accessible modal dialog with a programmatic title and native labelled controls.
- Move focus into the dialog, keep focus inside while open, support Escape to cancel when idle, and restore focus to Use lesson after closing.
- Show selection with a checkbox state, not colour alone.
- Ensure all controls, errors, and footer actions remain reachable on mobile, including with the keyboard open. Allow dialog scrolling rather than clipping content.

## 6. Verification checklist for the receiving agent

Use checks appropriate to the existing project. Verify at least:

- New labels appear in the intended areas without renaming unrelated controls.
- Saving an incomplete draft remains possible and private.
- Module title and goal can be blank without blocking the relevant actions.
- All four dialog selection states have the correct button label and behaviour.
- Unchecked options produce no side effects or hidden-field validation.
- Missing student and blank template name produce recoverable inline errors.
- A template name is prefilled and can be edited.
- Cancel and close do not assign or create templates and preserve lesson edits.
- Existing assigned content remains unchanged after editing the draft or template.
- Language selection supports multiple languages, per-language levels, search, removal, and missing-level validation.
- Decide later has an accessible selected state.
- Teaching experience is saved and editable without becoming mandatory.
- Verification information no longer looks clickable.
- Key flows remain usable on desktop, mobile, and by keyboard.

Report changed areas, verification performed, and any remaining simulated behaviour or unresolved implementation decisions. Do not claim real assignment, notifications, persistence, or deployment unless verified.
