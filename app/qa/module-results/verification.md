# Module results feedback — 5 November 2026

- Entered Students → Ongoing modules → Module results on desktop.
- Completed module picker shows vocabulary, grammar and speaking sample submissions for Léa.
- Each completed block includes its content, student response and Feedback field underneath.
- Recall and matching examples distinguish correct/incorrect and show the original teacher answer.
- Speaking displays a sample transcript/duration with an explicit no-audio-playback notice; written/spoken responses remain teacher-reviewed.
- Entered recall feedback, switched module and returned, shared in preview, reopened via direct results link: the text and shared snapshot were retained.
- Phone entry used the existing keyboard-aware textarea, opened the device keyboard, retained feedback, and marked edits separately from previously shared text. Phone content width and scroll width both 393px.
- Automated checks: production build, 28 protected runtime hashes, 20 teacher tests, 5 routing tests, 16 onboarding tests, 4 Sites tests passed.
- Unit checks cover feedback across different students/submissions, invalid saved data without overwrite, immutable submissions and existing shared snapshots, and deep links.

Limitations: fictional submission fixtures, browser-local feedback, simulated sharing only; no real student delivery or playback of student recording files. Offline/storage failure messages are implemented; storage exceptions tested at the reader boundary, not failure-injected in the browser. New editor lessons do not automatically create completed submissions. Existing lesson/source/live-site boundaries remain unchanged.

## Teaching-block refinement

Feedback fields and draft/shared labels are removed from teaching-only blocks, with viewed content retained. Browser check on vocabulary results confirmed zero teaching-block textareas and the practice feedback textarea still present. The sharing test now includes an old teaching-block draft and confirms it cannot be shared. Production build, 28 runtime hashes, 20 teacher tests and 4 Sites tests pass for this revision.
