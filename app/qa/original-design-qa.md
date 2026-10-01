# Mimo onboarding design QA

final result: passed

## Source and comparison setup

Source visual truth: `../reference/01.png` through `../reference/20.png`, downloaded from the user-supplied Mobbin flow. Source images are 720 × 1680; their app region is 720 × 1560 after excluding Mobbin's attribution footer. Each comparison normalizes that region to 393 × 852.

Implementation: http://localhost:4173, Codex in-app browser at a 1400 × 1200 viewport. The iPhone screen was measured at exactly 393 × 852 CSS pixels; saved screen captures are 393 × 852 pixels (effective output density 1). Native preview device chrome differs from the reference's older iPhone chrome and is excluded from fidelity findings.

Full-view comparison evidence:
- `qa/compare-welcome-verified.png`
- `qa/compare-language-final.png`
- `qa/compare-daily-goal.png`
- `qa/compare-widget-fixed.png`
- `qa/compare-benefits-final.png`
- `qa/compare-starting-point-final.png`

Each file puts the actual reference and rendered implementation side by side in one image. Text, controls, illustration edges, and spacing are readable at this resolution; additional zoomed crops were unnecessary. Other visited states have individual captures in `qa/`.

## Findings and fix history

1. P2, welcome scene positioning: the absolute scene initially resolved against a short scroll-content element. Set the app's scroll content to minimum full height. Verified against `qa/compare-welcome-verified.png`.
2. P2, option density: language rows were too tall, pushing the final row beneath the footer. Reduced row padding. Initial `qa/compare-language.png`; corrected `qa/compare-language-final.png`.
3. P1, dialog focus: focusing or restoring focus could scroll the enclosing hidden-overflow phone viewport, lifting the entire app and revealing offscreen keyboard assets. Added preventScroll focus and an app-scoped overflow:clip rule, preserving internal MobileScroll. Failure visible in `qa/compare-widget.png`. Corrected `qa/compare-widget-fixed.png`; frame scrollTop remained 0 after widget dialog and completion/replay. Runtime source files remained unchanged.
4. P2, benefits copy wrapping: description text was too large. Matched the 15px source body scale and top spacing. Corrected `qa/compare-benefits-final.png`.

No remaining actionable P0/P1/P2 findings within this onboarding prototype scope.

## Required fidelity surfaces

- Typography: local Nunito 400/700/800/900 substitutes for the unavailable source font. It preserves rounded styling, hierarchy and readable wrapping. Exact letterforms are a P3 difference.
- Layout: 16px screen gutters, top progress/navigation, companion and speech bubble, compact option stacks, and anchored CTAs match source composition. Adapted Mimo silhouette is taller than Duo. Six fully visible source languages are provided; the unidentifiable partial seventh row is omitted.
- Colors: green #58cc02, shadow #58a700, neutral #e5e5e5, selected fill #e1f5ff and blue accents. Browser screenshot color management visibly softens saturated colors relative to downloaded source images; CSS color values were checked.
- Imagery: supplied transparent Mimo image used locally throughout; original flags and illustrated icons extracted from source captures. Home-screen illustration retains source phone housing, with Mimo rendered in its widget card. Native phone chrome remains supplied by the template.
- Copy: source question sequence, choices and CTAs retained. Intentional adaptations: Mimo name/wordmark, removal of Duolingo's learner-count claim, dynamic language/goal values, explicit completion and simulated-service notices.

## Interaction verification

Passed in the actual browser:
- Splash → welcome → greeting → seven-question introduction.
- Required selection gates for language, level, reasons, goal, plan, starting point.
- Language list collapse/expand; French selection updates subsequent copy.
- Level selection, multiple motivations, and preservation when returning with Back.
- Daily goal selection; 10 minutes produces the reference's 50-word screen.
- Both Allow and Don't Allow local reminder paths.
- Both Add widget and Not now paths; dialog completion and frame stability.
- Both free and Super plan preferences.
- Find my level and Start from scratch final recommendations.
- Completion, return to setup, replay/reset, and account-scope notice.
- iPhone and Pixel device switching; compact 390 × 844 browser viewport (390px body width, no page horizontal overflow).
- Console: no warning/error entries at completion.
- Final TypeScript/Vite production build and mobile runtime integrity check passed.

## Scope and residual gaps

This is a local frontend mobile prototype, not an installed iOS/Android application. Account services, subscriptions, lessons, real assessment, notifications and OS widgets are not connected. State lasts for the current page session. Static Mimo artwork is used; the Mobbin video did not play, so exact source animation timing was not reproduced. The supplied screenshot sequence grounds all primary states.

## Implementation checklist

- [x] Local assets and rounded local font
- [x] Source-based screen sequence
- [x] Required selections and reversible navigation
- [x] Simulated OS prompts and explicit scope notices
- [x] Visual comparison and fixes rechecked
- [x] Production build and protected runtime integrity
- [x] Preview kept running and open on welcome
