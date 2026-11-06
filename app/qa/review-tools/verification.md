# Teacher review tools — 5 November 2026

Implemented the user's approved recommendations 1, 4, 5 and 6. Independence assessment categories and optional teacher-authored hints remain proposals; neither is inferred nor enabled automatically.

## Browser verification

- Desktop: Ongoing modules review queue shows student, module, submission date, attempt/revision label, review status, and number of responses to review. Status/search filters work. Review responses opens the selected speaking submission directly, rather than the first module for that student.
- Played the clearly labeled synthetic student sample; audio loaded fully with duration 6.06644 seconds. Selected 0.75× speed and confirmed the player's playback rate. Added a timestamp comment at 2 seconds; clicking its timestamp seeks to 2 seconds.
- Inserted a saved speaking comment into the three structured feedback fields; saved custom wording and saw it available after navigating away and reopening the submission.
- Set a task-completion assessment. Criteria can be renamed, removed and added; they default to Not reviewed. No proficiency or independence rating is derived.
- Added a written-response annotation on l’addition. The original response remains intact, the excerpt is highlighted, and the explanation appears below it.
- Added a private teaching note. The student feedback preview and the shared feedback exclude it. Both responses shared in preview; queue changed to Feedback shared with zero responses remaining.
- Attached a WAV as teacher voice feedback through the file chooser. It persisted in IndexedDB, loaded with readyState 4, and played back in the feedback preview. Microphone recording and permission-failure handling are implemented but were not exercised with a live microphone.
- Created a targeted spoken-practice draft from a reviewed response. The Module editor opened with the selected student, learning goal and prompt; the draft appeared in the lesson library. It was not applied automatically. Reuse activity preserves the original assessed format and answer keys; unit tests cover all current fictional response formats.
- Phone: queue search → speaking submission → structured feedback edit → assessment selection worked. Keyboard-aware fields use the retained runtime. Teacher content width and scroll width were both 393px. FlowStack navigation pauses the student sample and stops voice-feedback recording when the review screen becomes inactive.

## Automated verification

Production build, all 28 protected runtime hashes, 26 teacher tests, 5 routing tests, 16 onboarding tests, and 4 Sites tests pass. New checks cover sharing and private-note exclusion, pending/shared status, annotation evidence and timestamp bounds, malformed review data, independent follow-up drafts, and reuse of assessed activities without changing their source submissions.

## Prototype boundaries

Student responses, submission dates and revision state are fixtures, not incoming student work. The two student recordings were synthesized locally with the macOS Thomas voice for review-tool testing and are labeled as synthetic in the UI. No real student voice is bundled. Feedback/comments and follow-up drafts are browser-local; audio attachments are stored in IndexedDB. Shared feedback is a local snapshot, with no notifications, connected delivery, AI grading or cross-device synchronization. Editing a lesson cannot rewrite a completed submission.
