# Mimo source routing

Starting references, checked 22 October 2026; refresh when the task depends on current state.
Project: `/Users/matthieu/Projects/skema-project-learning`.
Read root `context.md` and `AGENTS.md`; read `app/AGENTS.md` before app work.
Do not edit app code as a side effect of specification writing.

- FigJam: https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd
- Scope do's: node `156:2022`; short editable preparation, clear outcome, less administration.
- Scope don'ts: node `156:2005`; one-to-one tutoring, no automatic assignment,
  group sessions, social feeds, public leaderboards, or compulsory daily actions.
- Teacher map: node `568:4173`; Gilbert, learner brief, reusable lesson adaptation,
  approval, teaching, recap; AI optional and teacher controlled.
- T03 adaptation card: node `589:3860`; reusable source preservation: `602:4033`.
- T04 approval card: node `589:3865`; approval and version states: `602:4039`.
  These two story cards and their enablers were read live on 30 October 2026.
  Source-backed planning rule: changed or unreviewed drafts cannot be shared as
  approved. The board does not define mandatory fields for approving a lesson.
- Combined map: `568:3620`; broader feature codes differ from teacher-only map.
  The local `output/linear-story-map/story-map.md` puts US15 reuse in R2, while the
  teacher map puts T03 adaptation in R1. Expose this discrepancy; do not claim an
  approved unified release or equate the maps' F04/F05 codes.
- Course `Story Mapping.pdf`: page 10 activity/backbone/narrative/release structure;
  page 11 role-goal-benefit; page 12 ID/title/type/description/BR/AC/AT and 3 amigos/BDD.
  Locate the user's supplied copy; do not require a hardcoded Downloads path.

Current project evidence includes a frontend teacher workspace using fictional
fixtures. `app/src/teacher/model.ts` defines `adaptLesson`, which creates separate
lesson/block IDs, links a student and source, adopts language/level/goal, resets
status to Draft, and clears sharedVersion. Existing tests cover source preservation.
This is not production persistence, authorization, AI generation, or user validation.
Use source-backed observations narrowly; inspect current source before declaring behavior.

Do not invent commercial, safeguarding, identity, age, retention, recording, or
production-provider policy. Research findings suggest needs; do not claim measured
time savings or learning improvements. Label invented lesson/student examples as fixtures.
