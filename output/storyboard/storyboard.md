# Mimo experience storyboard

Added to FigJam: https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=207-1777

Source review: 1 October 2026. Board personas, learner and teacher interviews, brainstorm, scope, and Six Thinking Hats notes; local app/src/Prototype.tsx and app/src/onboarding.ts. Scenarios and thought captions are illustrative, not participant quotations. Onboarding actions are simulated; later shared journey is proposed.

## 01 / Léa finds a starting point

### A moment of hesitation

RESEARCH-BASED SCENARIO

At a café, Léa knows some French but hesitates to order. App exercises have not given her the confidence or patient feedback she needs.

“I want to feel comfortable speaking.”

Source: Léa persona · learner interviews (node 44:2453)

### A friendly first step

ONBOARDING PROTOTYPE

Mimo welcomes her. She chooses “I want to learn”, enters her email, selects her age range and tries the sign-in code preview.

“I can take this one step at a time.”

Source: welcome → role → email → age → verify

### A goal that belongs to her

ONBOARDING PROTOTYPE

She chooses French, a level or “I’m not sure yet”, and Everyday life. Her goal: order a meal confidently. Adding a resource is optional.

“This is about what I need.”

Source: language → level → topic → goal → resource

### Ready, on her own terms

ONBOARDING PROTOTYPE

She picks a small practice target and meeting preferences, with location for in-person lessons. Reminders and widget are optional. Her summary ends before teacher discovery.

“I know what I’m looking for.”

Source: practice → format → availability → summary

## 02 / Gilbert gets ready to teach

### Too much preparation

RESEARCH-BASED SCENARIO

Gilbert adapts lessons to each learner, but preparation and admin compete with teaching. He wants reusable materials and meaningful conversation.

“Let me focus on the person.”

Source: Gilbert persona · teacher interviews (node 74:2049)

### Show how he teaches

ONBOARDING PROTOTYPE

He chooses “I want to teach”. After the email-code preview, Nori guides his display name, optional profile media, languages, levels and a short teaching approach.

“Learners should know my style.”

Source: teacher-intro → name → languages → approach

### Set clear expectations

ONBOARDING PROTOTYPE

He chooses a meeting format, location if relevant, lesson duration and price. The profile review brings these together. He can go back to adjust his answers.

“My time and approach are clear.”

Source: format → city → duration → rate → review

### Build trust, privately

ONBOARDING PROTOTYPE

He can finish verification later or try the sample sequence: legal name, birth date, issuing country, document and selfie. No identity check is actually submitted.

“I understand what stays private.”

Source: identity-intro → sample checks → draft

## 03 / Their paths meet

### Choose, then book

PROPOSED EXPERIENCE

Léa compares teaching style, reviews, price and availability, then chooses Gilbert. They agree on a one-to-one slot and meeting format, with clear confirmation and reminders.

“This teacher feels right for me.”

Source: Teacher fit · booking · calendar (node 132:1852)

### Prepare one useful lesson

PROPOSED EXPERIENCE

Gilbert reads her goal and any shared resource. He adapts short, reusable lesson blocks: vocabulary, one grammar point and café role-play. Optional AI suggestions remain his to review.

“A focused plan, with my judgment.”

Source: Modular lessons · editable teacher tools (node 132:1847)

### Practise with a real person

PROPOSED EXPERIENCE

They meet one-to-one in a café, with online as an alternative. Gilbert models natural speech, listens and adapts the pace. Léa asks questions and rehearses ordering.

“I can ask, try and try again.”

Source: Human interaction · practical speaking (node 156:2122)

### Take progress into real life

PROPOSED EXPERIENCE

Gilbert shares a short recap and relevant practice. Léa gives private feedback, tries ordering independently, and chooses her next goal. Progress means something she can do.

“I can use what we practised.”

Source: Feedback · relevant practice · private review (node 156:2022)

## Illustration production

The built-in image generation service failed twice with a network error. Final illustrations are editable vector scene drawings, authored in `draw-scenes.mjs` and saved as `editable-scenes.svg`, then imported into FigJam. Both drawings and captions can be edited in the board. The exported overview is `storyboard-overview.png`.
