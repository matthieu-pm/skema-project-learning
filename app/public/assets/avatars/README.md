# Fictional profile portraits

Generated on 11 November 2026 with the built-in `image_gen` tool: 25 sample teachers, four sample learners and six additional learner/reviewer identities. These portraits do not depict actual Mimo users. [prompts.json](prompts.json) preserves every final generation prompt and stable file mapping.

Style: natural editorial headshots, centered face and upper shoulders, soft daylight and pale lavender backgrounds, varied ages and appearances, no text or watermarks. Final WebP files are 320px wide, compressed at quality 82 without changing image content. Images stay locally served and lightweight.

Teacher IDs match `src/learner/model.ts`; learner portraits use `student-` plus the ID in `src/teacher/model.ts`. The shared ProfilePortrait component keeps initials as a load-failure fallback. Learner profile/account and public review authors also use these assets through LearnerAvatar, with consistent author-to-portrait mappings. The generated Gilbert portrait is used only for the seeded Gilbert teacher profile, not custom teacher names.
