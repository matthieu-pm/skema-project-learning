# Ongoing modules: normal scrolling

Date: 11 November 2026.

The user's latest clarification is that the **Review queue / Lessons by student** switcher should scroll away with the Ongoing modules page. It remains in ordinary document flow on desktop, narrow web and phones. This replaces the earlier sticky interpretation; prior sticky captures and release records are historical evidence only.

The correction removes the switcher's sticky positioning and the extra page wrapper introduced for that behavior. Keep the existing responsive content spacing, separate workspace toolbar, both view controls, retained queue filters and protected phone scrolling. Availability, sidebar and other sticky surfaces are outside this correction.

## Focused automated verification

```sh
MOBILE_RUNTIME_TEST_PORT=4195 npx playwright test tests/module-views.spec.ts --workers=1 --reporter=line
```

**3/3 passed on the first run in 5.8 seconds**, at 1280×720, 1024×720 and 390×640. The existing parameterized spec now checks the corrected behavior instead of the prior sticky interpretation; no extra cases were added.

Real wheel input scrolls the actual `.teacher-web .tw-content` owner. The switcher's vertical movement matches the scroll delta and it becomes fully offscreen; further scrolling keeps moving it alongside the review rows. The separate toolbar stays in place and the document itself does not scroll. After wheeling back to the top, both views remain usable, student selection works, and no horizontal overflow appears.

Final checks passed:

- `npm run build`: TypeScript, production Vite build and Sites static-worker packaging.
- `npm run check:runtime`: all 28 protected runtime files matched their hashes; the build's prebuild check passed too.
- `git diff --check`: clean.

No unrelated browser or unit suites were repeated for this scoped correction. The verification agent changed only the existing module-view test and this record; product-source and protected-runtime changes remained outside that work.

## Native proof and limits

The implementation owner's final native WebKit review confirmed `position: static`. At scrollTop 0 the switcher began at y=202.40px. After a keyboard PageDown moved the content owner to scrollTop 260, its top was y=-57.60px and its bottom was y=9.90px, entirely above the content viewport's 64px top. This confirms ordinary scrolling rather than a pinned surface.

Captures: `before-scroll.png` and `after-scroll.png`.

Automated checks cover local Playwright Chromium at the three web widths; native review is separate in-app WebKit evidence. No new physical-phone, comprehensive accessibility or hosted-flow check is claimed. Deployment readiness and the stable production alias are recorded separately after promotion.

## Module-results copy removal and final combined checks

The user also requested removing the fallback explanation “Unreviewed means no student-facing feedback yet. Draft feedback stays private until shared.” The navigation status is now rendered only for the existing recording-busy, no-unreviewed-responses or last-unreviewed-response states; ordinary navigation has no empty status paragraph.

Read-only source review confirmed those three messages retain their prior conditions and priority, and that Previous block, Jump to block, Next block and Next unreviewed keep their existing disabled/navigation guards. This review does not claim new runtime exercise of the dynamic edge cases.

After the copy change, final `npm run build` passed TypeScript, production Vite and Sites packaging. Explicit `npm run check:runtime` and the build's prebuild check matched all 28 protected files, and `git diff --check` passed. No new copy-removal tests were added; the three successful normal-flow browser cases above were not repeated for this simple conditional-copy change.

The implementation owner's final native review opened Léa's module results on a teaching block. The exact helper text was absent, there were zero status paragraphs inside `.mr-block-nav`, and all four navigation controls remained present. Capture: `results-note-removed.png`, taken after PageDown brought the full navigation into view. No native dynamic-edge-case check is claimed.
