# Mimo user journeys

Created and verified on 2 October 2026.

## Current original teacher story

[Gilbert · Original user journey](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=372-2151) is the latest redo: one continuous horizontal journey, five stage bands, and seven single-action steps. It has four aligned rows: Stages, Steps, Touchpoints, and Experience (emotions and illustrative verbatims). It was added below the preserved expanded teacher map (`332:2301`).

`teacher-original-redo-state.json` contains the current node mapping and passing structural check. `teacher-original-redo.png` was visually verified. The original teacher narrative remains in `journeys.json`. No app code changed.

## Earlier versions

The links and screenshots below describe the earlier collection, not the latest live layout. Its original collection and teacher container IDs were absent in the live board at redo time. `teacher-expanded.json` stores the later detailed onboarding narrative; the nine-panel screenshots are historical and are not evidence of the latest board layout.

- [Collection](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=300-2077)
- [Student journey](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=301-2077)
- [Teacher journey](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=301-2202)

Two editable maps, each with five broader stages spanning seven single-action steps. Each step contains one action, touchpoints, an emotion, an illustrative first-person statement and an experience driver. The emotional arc is qualitative and unvalidated. Statements are not interview quotations. Current onboarding and proposed later experiences are labeled separately.

`journeys.json` contains the narrative source. Each step array is: title, status, action, touchpoints, emotion, illustrative statement, qualitative curve position, experience driver. Curve positions control drawing height only and are not research measurements.

`student.png`, `teacher.png` and `overview.png` are final screenshots. All three were visually inspected. A structural check found zero section-child overflow and zero sibling-text overlaps. No app implementation changed.

Live research anchors: Léa persona `44:2453`, teacher adaptation `69:1642`, creative control `69:1698`, and projected feelings `165:1878`. The current project context provides onboarding behavior and product-scope boundaries.

The Stages row groups steps into broader phases. Student: Awareness (1–2), Onboarding (3), Booking & preparation (4–5), Lesson (6), Progress (7). Teacher: Awareness (1), Onboarding (2), Lesson preparation (3–5), Teaching (6), Follow-up (7). Updated screenshots and structural checks passed after adding this row and making every step one action.
