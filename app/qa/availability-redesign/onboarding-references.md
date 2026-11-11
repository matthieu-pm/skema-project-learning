# Onboarding references from Mobbin

Researched 11 November 2026 for the request to suggest other onboarding designs, with Cal.com as a preferred example. This is reference research only: no onboarding implementation or flow change is approved or included here.

All references below are **web** flows. Observations describe only the inline images actually inspected, not every screen listed by the search metadata. The current Mimo onboarding remains the eight-screen teacher setup with separate optional identity checking, direct summary edit/save return, deferred lesson terms, and the 11 November Geist/monochrome design.

## Recommended: a compact Cal.com wizard

[Cal.com — Onboarding, 19 screens](https://mobbin.com/flows/8400c4ca-9733-480c-b243-ba58806c88a6?tab=screens&utm_source=chatgpt&utm_medium=ai-assistant&utm_source_platform=mcp)

**Visible patterns:** preview 10 places a short profile form in a small centered white surface, with the heading and explanatory text immediately above it, an explicit “Step 1 of 5” label, progress underneath, and a full-width dark Next Step button next to the entered information. Preview 15 retains the same composition for availability and shows the week as compact rows with adjacent start/end controls. Preview 6 uses a signup form on the left and a booking-page example on the right, making the outcome visible during setup.

**Suggested Mimo direction:** bring the form, step name, progress, and primary action into one compact area. Retain Mimo's own eight-step count and all current branches. Show a meaningful teaching-profile example only when it helps explain an actual profile decision. The existing structured review becomes the larger final step.

**Fit:** strongest match for the requested restrained style and the user's Cal.com preference. It also connects naturally to the separate availability redesign.

**Tradeoff:** a compact surface can become crowded on language/level or lesson-detail forms; those steps should retain a wider form and normal scrolling rather than shrinking text. The observed Cal.com flow's exact five-step sequence, password fields, calendar integrations, and business rules are not proposed for Mimo.

## Alternative: Calendly's form with outcome preview

[Calendly — Joining an organization, 13 screens](https://mobbin.com/flows/4241ada5-42d2-498a-8ba9-e905c36795c1?tab=screens&utm_source=chatgpt&utm_medium=ai-assistant&utm_source_platform=mcp)

**Visible patterns:** preview 7 has one question above a two-column choice grid, Back below left, Next below right, and a clear step counter at the top. A distinct right-hand area holds supporting examples. Preview 10 carries that shell into a weekly-hours form; the supporting area shows a calendar and time-selection example.

[Calendly — Onboarding, 18 screens](https://mobbin.com/flows/4ba7e4e8-c369-439b-8225-401e274ba9d5?tab=screens&utm_source=chatgpt&utm_medium=ai-assistant&utm_source_platform=mcp)

**Visible patterns:** preview 14 makes the main role decision two large side-by-side cards with a visible selected outline and a single Continue action. Preview 18 moves remaining setup into a checklist alongside the workspace.

**Suggested Mimo direction:** on desktop, use a clear form column and a small profile or lesson-details preview that reflects the user's actual answers. Learner/teacher choice could use two simple cards. On phones, place the form first and collapse the supporting preview.

**Fit:** useful when teachers need to understand how their introduction, language choices, or lesson terms will appear to learners.

**Tradeoff:** more visual material and a wider composition than the Cal.com option. Keep Mimo's monochrome controls; the references' blue brand palette and decorative artwork are not part of this suggestion. A workspace checklist would be a larger flow change and remains only an alternative, not an implementation decision.

## Alternative: Linear's quiet, focused account screens

[Linear — Onboarding, 18 screens](https://mobbin.com/flows/cbaf58a9-fd84-4afe-b214-e65b24484013?tab=screens&utm_source=chatgpt&utm_medium=ai-assistant&utm_source_platform=mcp)

**Visible patterns:** preview 5 presents email recovery as a small centered group with a clear manual-code alternative and Back to login. Preview 14 places an optional invitation form in the center and exposes “I'll do this later” as a separate secondary path. The shown setup screens use broad whitespace and very little competing interface.

[Linear — Onboarding, 25 screens](https://mobbin.com/flows/64ae582c-747c-4c77-8629-812abcbef186?tab=screens&utm_source=chatgpt&utm_medium=ai-assistant&utm_source_platform=mcp)

**Visible patterns:** preview 7 keeps code entry and Continue together; preview 13 groups related workspace fields and their action in one compact central form.

**Suggested Mimo direction:** use this restraint for email/code entry and optional identity handling: concise heading, one form, obvious recovery and deferral actions. Keep Mimo's explicit step labels rather than relying only on the small progress dots visible in some reference screens.

**Fit and boundary:** Linear is a different product category. It is cited only for account-form grouping, recovery clarity, and deferral hierarchy; its team setup, tutorials, commercial rules, and welcome-only stops do not belong in Mimo's tutoring flow.

**Tradeoff:** the quietest option, but it can provide too little explanation for a new teacher. Add short, local help only where a decision needs it rather than adding extra introduction screens.

## Search and inspection record

- Searched `Cal.com onboarding`, web, two flows; the named app and Onboarding flow were present. Inspected returned preview positions 1/6/10/15/19 for the relevant 19-screen flow.
- Searched `Calendly onboarding`, web, two flows; both returned flows were Calendly. Inspected the returned previews, with the cited observations limited to positions 7/10 in the 13-screen flow and 14/18 in the 18-screen flow.
- Searched `Linear onboarding`, web, two flows; both returned flows were Linear. Inspected returned previews, with the cited observations limited to positions 5/14 in the 18-screen flow and 7/13 in the 25-screen flow.
- Every search used the same task intent and `output_destination: code`; no output tool was provided.
- No authentication/plan refusal, missing-image fallback, or `ai_usage_notice` was returned.
- The inline preview images were inspected, not exported. Canonical Mobbin links are retained above; expiring image links are not used as durable citations.
