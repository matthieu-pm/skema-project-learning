# Public teacher lessons: Figma sources

Date: 11 November 2026.

The user supplied the [Mimo Students file, node 9:2](https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=9-2) as the content reference for missing teacher-profile lesson information. The current minimal Geist/neutral app design remains the visual direction.

## Inspected references and boundaries

| Source | Role in this feature |
| --- | --- |
| [Teacher profile, 14:545](https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=14-545) | Associates Gilbert with A conversation at the café and its French A2 / six modules / nine blocks / 30 minutes summary. |
| [Lesson overview, 14:621](https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=14-621) | Supplies the public title, description and three learning outcomes. |
| [Curriculum, 97:2345](https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=97-2345) | Supplies the six module names, durations, block counts and Warm-up preview label. Curriculum means lesson outline. |
| [Session details, 14:1338](https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=14-1338) | Inspected as reference only. The current feature is public lesson browsing before booking, without session progress or completed responses. |

## Verified public lesson

Teacher: Gilbert. Title: **A conversation at the café**. Language/level: **French A2**. Duration: **30 minutes**. Totals: **six modules, nine blocks**.

Description:

> Order a drink and ask a natural follow-up question. Practice useful words, build your sentence and try it with your teacher.

Outcomes:

- Order a drink politely
- Ask a natural follow-up question
- Try it in your own words

| Module | Minutes | Blocks | Supplied preview |
| --- | ---: | ---: | --- |
| Warm-up | 5 | 1 | Vocabulary recall · Practice |
| Vocabulary | 5 | 2 | — |
| Grammar | 5 | 2 | — |
| Listening | 5 | 2 | — |
| Speaking | 5 | 1 | — |
| Reflection | 5 | 1 | — |

The source provides no additional preview content for the other modules. A disclosure can expose the supplied Warm-up label without fabricating a practice question, answer, progress state or student submission.

## Local book artwork

These are exact SVG downloads from the supplied Figma designs, rather than generated substitutes:

| Local file | SVG root dimensions | Figma source |
| --- | --- | --- |
| `public/assets/lessons/cafe-book-mini.svg` | 31.6244 × 31.6244 | Teacher-profile asset from node 14:545. |
| `public/assets/lessons/cafe-book.svg` | 54.2131 × 54.2132 | Lesson-overview asset from node 14:621. |

The full download URLs are recorded in [the book-art provenance](../../public/assets/lessons/SOURCE.md). The local SVG files retain their downloaded artwork.

## Local implementation status

The typed public catalog is in `src/learner/public-lessons.ts`, with stable lesson ID `gilbert-cafe` and teacher ID `gilbert`. It is independent of private teacher-course drafts, teaching notes, identity records and learner submissions. Only this verified Gilbert lesson is populated; other teachers receive no invented lesson catalog.

Public profile/card/detail UI is being integrated. Preserve existing booking/message entry points, availability, public reviews, booked-session price/duration snapshots, country text and the protected phone runtime. A public lesson outline does not create enrollment, progress or a booking.

UI verification is pending. This source record makes no test, deployment or production-release claim. The verification agent owns the separate verification record.
