# Mobile Prototype Agent Guide

At the start of every new chat or task, read the project [context.md](../context.md) and [root AGENTS.md](../AGENTS.md) before planning or making changes, then read this guide in full.

## Prototype Instructions

In ChatGPT Work Mode, run `sites-preview start "$PWD"`, open `http://terminal.local:4173/` in the cloud browser, and verify the rendered app and its primary interactions. Keep that preview open and tell the user to inspect it in the cloud browser; do not present the local URL as a user-facing chat link. In Codex Desktop, run the local server yourself, open the preview in the in-app browser, and provide the clickable local URL. Do not deploy to Sites unless the user explicitly asks to share, publish, or deploy. Do not give the user server-start instructions when you can run it.

Before planning or implementing any mobile-app change, read this `AGENTS.md` in full. It is the source of truth for the template's runtime and component guidance.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Editing Boundary

- The separately requested 6 October 2026 landing page is in `public/landing/` and is served in development at `/landing/index.html`. Its visual reference is Clay's go-to-market platform, not the personal CRM named Clay. Preserve the original onboarding at `/` and the protected runtime. Landing-specific styles/scripts stay separate; product previews on the page remain labeled concepts.
- Later landing feedback on 6 October: follow the supplied Clay homepage screenshot more closely, including its illustrated landscape hero, green headline area, and large pastel feature panels. Use Hugeicons for interface icons and imagegen for needed background imagery. Generated page assets live in `public/landing/images/`; the original Mimo companions remain unchanged. The web page's palette does not redefine onboarding role colors.

- Landing feature panels: stack the four pastel cards on scroll, each over the previous; preserve readable tall cards on mobile and ordinary flow for reduced motion.
- Landing typography: keep small text at least 12px on desktop and mobile, including captions, badges, table labels, and review metadata.
- Landing goal buttons (Travel, Work, Everyday life): no selection checkmarks; retain their category icons and selected color/bold styling.
- Review card colors: mostly warm white, with occasional soft purple and blue cards (eight white, two purple, two blue across twelve reviews).
- Reviews move right to left in two slow continuous rows of six different reviews each, with no visible pause button; use equal quote font sizes, including the purple card, and retain pause/reduced-motion support.
- First landing card after the hero: use the mock learner/teacher review mosaic with generated avatars; these are fictional preview testimonials; the user requested removal of the visible sample-review notice.
- Landing headings: omit small uppercase eyebrow labels above the hero and section headings.
- Navigation motion: match the slow 520ms rolling text and underline on desktop and mobile-menu links; support keyboard focus and reduced motion.
- Navigation height: keep the landing header compact at 58px on desktop and 54px on mobile, with centered controls and its top-edge attachment.
- Navigation branding: companion-only home link, no visible “mimo” text in the header; retain its accessible name.
- Button pacing: use the slower 680ms main roll, 520ms navigation roll, 560ms feature roll with 20ms stagger, 300ms goal roll, and 460ms prompt roll requested by the user.
- Button motion: preserve rolling-text variants on landing actions (upward primary, downward yellow, staggered colored features, faster goal controls), stable compact geometry, keyboard parity, and reduced-motion support.
- Hero artwork: purple Luma plays on the left, blue Nori reads on the right; do not center the pets. Keep both visible in the mobile panorama.
- Latest landing feedback on 6 October: use Labil Grotesk for this website, shorter 36px buttons (32px navigation), and larger 14px button corners. The navigation must attach directly to the top edge like a dynamic island. Preserve Nunito in the phone onboarding.

- Build app-specific UI in `src/Prototype.tsx` and `src/prototype.css`.
- Treat `src/App.tsx`, `src/main.tsx`, `src/styles.css`, `src/mobile/`, `public/assets/iphone/`, `public/assets/android/`, `public/assets/status/`, `vite.config.ts`, `worker/index.js`, and `scripts/prepare-sites-build.mjs` as protected runtime files. Do not edit, replace, remove, or recreate them unless the user explicitly asks to change the mobile runtime itself. For an explicit runtime change, update the affected lock hashes only after verifying the new runtime behavior.
- Run `npm run check:runtime` before preview or handoff. If it fails, restore the protected runtime instead of weakening or bypassing the check.
- `npm run build` preserves the mobile runtime and prepares the static Cloudflare Worker output required by Sites. Before a Sites handoff, confirm `dist/client/index.html`, `dist/server/index.js`, `dist/.openai/hosting.json`, and source `.openai/hosting.json` exist, then run `npm run test:sites`. Do not replace this project with a Vinext starter.

## Runtime Contract

- Preserve the mobile device runtime unless the user's task explicitly asks otherwise. Do not replace it with a standalone page. Visual fidelity applies to app-owned content inside the device screen, not to template-owned device chrome.
- Keep `App` composed around `PhoneFrame` -> `KeyboardProvider`, with `StatusBar`, app content, `HomeIndicator`, and `KeyboardDock` mounted inside the phone frame. `StatusBar` and the iOS home indicator are overlaid device chrome. When the Android keyboard is closed, the app viewport reserves the protected navigation-bar region instead of painting behind it. When the Android keyboard is open, preserve the current full-screen keyboard layout: its asset includes the IME navigation strip and the separate black navigation bar is hidden. iOS screens continue to paint behind the home-indicator area and own their safe-area content padding.
- Preserve the `iPhone` / `Pixel 10` device picker and both calibrated device presets. The Pixel screen is `427 x 952`; its `32 x 32` camera circle and `public/assets/android/navigation-bar.svg` bottom navigation bar are protected device chrome, not app content.
- Preserve the device picker's intentionally lightweight Codex styling in the top-right corner: its trigger wrapper is borderless and transparent, its trigger sizes to content, and its right-aligned menu uses the compact 3px inset plus the specified hairline and elevation shadow layers. Keep the prototype root and default app screen white.
- Preserve `StatusBar` as live device chrome, including its platform-specific typography, source status-icon assets, and spacing. Pixel 10 uses Roboto, Android indicators, and 32px top, left, and right padding. iPhone uses its iOS indicators, system typography, and calibrated spacing. Do not hardcode screenshot times like `9:41` into the status bar, replace its real-time clock, or move status bar content into app markup unless the user explicitly asks for a fixed/mock device time.
- `PhoneFrame` owns the calibrated device frame, screen portal, device picker, camera cutout, and custom cursor. Keep device assets in `public/assets/iphone/` and `public/assets/android/`; if an asset fails to load, repair the asset path or restore the asset instead of removing the frame, keyboard, or image render.
- Use `MobileScroll` directly for simple single-screen prototypes. Use `FlowStack` for conventional multi-screen flows whose routes can own their fixed header and footer; when using it, define each route as a `FlowScreen`: `{ id, header?, headerHeight?, footer?, footerHeight?, render }`, and use `flow.push(screen)`, `flow.pop()`, and `flow.replace(screen)` from `FlowStack` render callbacks or `useFlow()` instead of introducing another router.
- Use `Carousel` for a carousel, horizontal rail, swipeable cards, image or media strip, horizontally scrollable cards, chip rail, or other horizontal collection.
- For a layered app shell—such as a persistent composer, independently presented sheet, pushed/peek sidebar, or app-wide transition—compose directly in `Prototype.tsx` rather than forcing it through `FlowStack`. Keep app-owned fixed chrome as sibling layers outside `MobileScroll`.
- When using `FlowScreen`, put route-owned fixed headers or footers in `FlowScreen.header` or `FlowScreen.footer`. Set `headerHeight` to the visible app-toolbar height; `FlowStack` adds the device's top safe-area/status-bar inset automatically. Do not include `StatusBar` or its height in the header. Set `footerHeight` to the full app-footer height. `FlowScreen.footer` is an overlay, not reserved layout space; screens using it must add their own bottom content padding such as `padding-bottom: calc(var(--flow-footer-height) + var(--mobile-safe-area-height) + 24px)` so final content can scroll above the footer while still painting behind it.
- Render only scrollable content inside `MobileScroll`; it is for content that should move with scroll and rubber-band overscroll. Keep app-owned headers, nav bars, tabs, composers, and overlays outside it. This keeps scroll physics, safe areas, keyboard insets, scrollbars, and drag click suppression active without letting content paint under fixed chrome.
- Buttons, links, cards, and images inside `MobileScroll` should still allow drag scrolling when the pointer moves beyond tap slop. Use `data-scroll-drag="ignore"` only for rare controls that must own the drag gesture themselves.
- Do not add `var(--keyboard-height)` to ordinary screen/content padding inside `MobileScroll`; the scroll viewport already shrinks above the simulated keyboard. For custom fixed composers, search bars, or toast chrome, use `useKeyboardInsets().bottomInset`. It is relative to the app viewport: Android returns `0` while the closed-keyboard viewport already reserves navigation, then returns the keyboard height while open; iOS continues to clear the home indicator while closed and ride directly above the keyboard while open. Do not pin custom bottom chrome to `bottom: 0` or only `keyboardHeight`.
- Use `KeyboardInput`, `KeyboardTextarea`, or `MobileTextField` for every text-entry control. A raw `input` or `textarea` disconnects focus, keyboard animation, safe-area insets, and attached surfaces.
- Use `BottomSheet` for phone-scoped sheets. Its props are `open`, `onOpenChange`, `title`, optional `description`, optional `snap`, and `children`; it renders through the phone screen portal and dismisses the keyboard before opening.

## Horizontal Carousels

- Use `Carousel` for horizontally draggable cards, images, media, chips, or other horizontal collections. Do not recreate these with `overflow-x`, custom pointer handlers, or a generic div.
- `Carousel` can be nested directly inside `MobileScroll`. It owns horizontal gestures and automatically yields vertical gestures to the parent.
- Never put `data-scroll-drag="ignore"` on or around a `Carousel`; doing so prevents vertical parent scrolling when a gesture begins inside it.
- Do not add CSS scroll snapping to `Carousel`; its runtime owns momentum and release motion.
- Use `data-scroll-drag="ignore"` only when a control must prevent parent scrolling in every drag direction.

See `src/mobile/COMPONENTS.md` for the full component and gesture contract.

## Keyboard Rule

The simulated keyboard is a separate top-layer component. Before presenting anything that behaves like iOS navigation or modal UI, dismiss it first.

Call `keyboard.hide()` before:

- pushing, popping, or replacing FlowStack routes
- opening bottom sheets, action sheets, dialogs, menus, or navigation sheets
- starting transitions where the destination should not inherit text-input focus

`FlowStack` already hides the keyboard for `push`, `pop`, and `replace`. `BottomSheet` already hides it before opening. If you add new modal/sheet/navigation primitives, follow the same rule.

When a composer, search surface, or other keyboard-attached component closes, call `keyboard.hide()` in the same event before changing that component's open state. Position attached surfaces from `useKeyboardInsets()` rather than a separate timer or visibility flag so both dismiss together.

When any text-entry control loses focus, dismiss the simulated keyboard. If the control is custom or does not use the runtime's keyboard-aware fields, handle its blur event and call `keyboard.hide()` explicitly. Keep the keyboard open only when focus is moving directly to another text-entry control that should share the same keyboard session.

## Interaction Rules

- Do not trigger buttons or inputs after a pointer has become a drag. Preserve the drag suppression behavior in `MobileScroll`.
- Do not allow native browser image/file dragging inside the phone frame. Preserve the phone-level `dragstart` suppression and non-draggable image styles so scroll drags that begin on images still scroll the prototype.
- Use `KeyboardInput`, `KeyboardTextarea`, or `MobileTextField` for text entry so the simulated keyboard and safe-area insets stay connected.
- Fixed phone chrome should not animate with pushed screens. Screen content can animate; the status bar, camera cutout, and preview chrome should stay put.
- Keep the keyboard below the home indicator/safe area layer in z-index, and above ordinary app UI while visible.
- Keep the home indicator as the topmost safe-area layer in the z-index above everything else in the prototype.

## Onboarding direction (2026-10-01)

Preserve the existing Duolingo-inspired Mimo design (rounded Nunito, raised CTAs, colored selections, companion speech bubbles). Use Figma section `w4nc4L3hNF63uh2HBX9Np5 / 7:22` for onboarding content and learner/teacher branches, not its visual palette. Keep one decision or entry action per screen. Retain existing welcome and useful encouragement screens where they fit the tutoring flow.

Teacher-specific direction: use blue primary CTAs/progress and orange selected options. Learner styling uses purple primary controls and blue selections. This is a color-only change; preserve the existing screen content and routing, including the existing identity-verification sequence.

The teacher companion is the supplied blue Nori (`all-models-and-images/pets/nori.png`); the learner companion is purple Luma (`all-models-and-images/pets/luma.png`).

Option press feedback must not affect sibling layout. Use transform-only movement; keep border widths, margins and dimensions stable while pressed.

Fit ordinary onboarding content within the phone above the fixed CTA wherever practical, especially teacher completion and language/level lists. Avoid duplicate companion illustrations on summary pages. Preserve scrolling for the keyboard, long user-entered content and accessibility needs instead of hiding overflow.

Teacher age update: skip the early age-range and guardian steps for teachers. Ask date of birth once, as its own screen after legal name in the identity-verification preview. Retain learner age-range/guardian routing. Do not invent a minimum teaching age or connect a verification provider without a separate request.

Learner/default primary buttons, progress, action text and wordmark use purple. The shared welcome uses Luma; switching to teachers uses Nori and the blue/orange teacher palette. Keep the app name Mimo.

Learners do not set daily practice goals: omit routine, daily-minute selection and commitment screens. Keep their personal learning objective. Ask simply to allow notifications (Allow notifications / Not now), without practice reminders or streak commitments.

The widget preview shows Luma saying “You’ve got this!” in a speech bubble, with no day count. Its illustration and spacing must fit within the phone above the fixed actions without scrolling.

Adult learners have the sample identity-verification sequence after benefits. For under-18 learners, place the guardian handoff and the adult’s full identity check immediately after email code verification, before language selection. Completing or deferring guardian verification continues to learner preferences; do not repeat verification after benefits. Keep one action per screen, purple/Luma styling, and the finish-later option. Switching age branches clears identity details. No real IDs, selfies, invitations, or consent are submitted.

Primary CTA press feedback must release automatically after a click. Preserve its raised shadow while focused; focus is not a pressed state. Keep a visible keyboard focus indicator and respect reduced motion.

Learners can select multiple languages. Their language screen has checkboxes, no search field, and ‘More languages coming soon!’ Each selected language has its own level screen and summary entry. Deselecting a language removes its saved level.

Style the learner’s ‘More languages / Coming soon!’ message as a non-selectable rounded, raised lavender card with a small Luma companion, matching the language option geometry. Keep the screen fitting above Continue.

The coming-soon card uses a generated Luma lookout pose (`luma-coming-soon.png`), with an arm raised above its eyes in anticipation. No decorative star in the card. Keep the original Luma asset on other screens.

Identity introduction offers Link Persona ID using the supplied Persona logo for all roles. It opens a local sample-link preview that skips document/selfie entry and returns to the correct branch. Keep the document fallback and finish-later paths. Do not imply a real Persona account is connected or a real identity has been verified.
