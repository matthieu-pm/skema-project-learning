# Button motion verification · 6 October 2026

- Primary actions: upward rolling label, 340ms ease-out; navigation uses 260ms.
- Yellow action: downward label, downward arrow nudge.
- Feature actions: per-character upward roll, 280ms with 10ms stagger capped at 120ms.
- Goal selector: 150ms roll; phrase shortcuts: 230ms roll.
- Hover applies only with fine pointer/hover support. Keyboard focus uses identical transforms.
- Labels have stable overflow windows. Animated duplicates are aria-hidden; staggered labels have one screen-reader-only name.
- Browser verified transition start and completed transforms on the yellow CTA; stagger delays and completed transforms on feature CTA. Height remained 36px. Accessible names remained single labels, and Work selection still updates its lesson.
- Production build and all 28 protected runtime files pass.
- Reduced-motion rules were inspected in source; OS reduced-motion emulation, native pointer-hover playback, and 10% speed replay were not verified.
