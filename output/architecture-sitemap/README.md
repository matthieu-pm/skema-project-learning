# Mimo app architecture and website sitemap

Created 9 October 2026 in the existing FigJam file. User confirmed architecture means screens and navigation.

- Collection: https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=484-3607
- App architecture: https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=482-3564
- Website sitemap: https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=480-3392

## Scope and sources

App hierarchy combines the implemented local onboarding in app/src/onboarding.ts and app/src/Prototype.tsx with the proposed home navigation documented in context.md and the goal-based user flows. Learner tabs: Home / Explore / Sessions / Profile. Teacher tabs: Today / Learners / Lessons / Profile. Messages are accessed from the header. Diagram layout is hierarchical, not tab display order or chronological task order. Leaf boxes group related screens. Proposed areas are explicitly labeled; no downstream workspace is implemented by this task. Guardian handling applies to under-18 learners; teachers use identity only. Account, guardian and identity steps are simulations.

Website hierarchy is sourced from app/public/landing/index.html and landing.js. One landing page at /landing/index.html; hash labels are anchors in that page. Travel, Work and Everyday life are interactive examples, not routes. Preview CTAs link to the onboarding app at /. No additional website routes were invented.

## Verification

Both diagrams and their collection screenshot were visually inspected. Added internal implementation-status headings after initial render. 45 editable shape nodes and 44 connectors; no dangling connector endpoints or out-of-section content in the structural check. The final heading positions fit the existing 48px group inset. Existing board content was preserved. No app code changed or runtime tests run.

Local screenshots: overview.png, app-architecture.png, website-sitemap.png. The app screenshot includes implementation-status headings added after Mermaid generation.

## App architecture Mermaid

```mermaid
flowchart LR
subgraph appMap ["App architecture · Screens and navigation"]
app["Mimo app"]
subgraph current ["Implemented · Local setup preview"]
setup["Welcome and role choice"]
account["Account method"]
learnerSetup["Learner setup"]
teacherSetup["Teacher setup"]
identity["Guardian and identity"]
setup --> account
account --> learnerSetup
account --> teacherSetup
learnerSetup --> identity
teacherSetup --> identity
end
subgraph learnerArea ["Proposed · Learner workspace"]
learner["Learner navigation"]
home["Home"]
explore["Explore"]
sessions["Sessions"]
learnerProfile["Profile"]
homeScreens["Next lesson, practice, progress"]
exploreScreens["Teacher search, profile, booking"]
sessionScreens["Booking details, lesson, recap"]
learnerSettings["Goals, preferences, account"]
learner --> home
learner --> explore
learner --> sessions
learner --> learnerProfile
home --> homeScreens
explore --> exploreScreens
sessions --> sessionScreens
learnerProfile --> learnerSettings
end
subgraph teacherArea ["Proposed · Teacher workspace"]
teacher["Teacher navigation"]
today["Today"]
learners["Learners"]
lessons["Lessons"]
teacherProfile["Profile"]
todayScreens["Upcoming sessions and lesson room"]
learnerScreens["Learner brief, work, feedback"]
lessonScreens["Lesson library and editor"]
teacherSettings["Profile, availability, payouts"]
teacher --> today
teacher --> learners
teacher --> lessons
teacher --> teacherProfile
today --> todayScreens
learners --> learnerScreens
lessons --> lessonScreens
teacherProfile --> teacherSettings
end
subgraph sharedArea ["Proposed · Shared access"]
shared["Across both workspaces"]
messages["Messages via header"]
help["Help, reporting, recovery"]
shared --> messages
shared --> help
end
app --> setup
app -.-> learner
app -.-> teacher
app -.-> shared
end
style appMap fill:#FFFFFF,stroke:#B3B3B3
style current fill:#F1FBF3,stroke:#66D575
style learnerArea fill:#F8F5FF,stroke:#874FFF
style teacherArea fill:#F1F8FF,stroke:#3DADFF
style sharedArea fill:#F6F6F6,stroke:#B3B3B3
style app fill:#DCCCFF,stroke:#874FFF
style setup fill:#CDF4D3,stroke:#66D575
style learner fill:#DCCCFF,stroke:#874FFF
style teacher fill:#C2E5FF,stroke:#3DADFF
```

## Website sitemap Mermaid

```mermaid
flowchart LR
subgraph siteMap ["Website sitemap · Current implementation"]
landing["Landing page /landing/index.html"]
hero["Hero and preview CTA"]
reviews["Illustrative reviews"]
how["How it works #how-it-works"]
ideas["Lesson ideas #possibilities"]
features["Learning feature panels"]
teachers["For teachers #teachers"]
explore["Explore Mimo shortcuts"]
faq["FAQs #questions"]
closing["Closing CTA and footer"]
discover["For learners #discover"]
lessons["Practical lessons #lessons"]
connection["Human conversation #connection"]
progress["Personal progress #progress"]
travel["Travel example"]
work["Work example"]
everyday["Everyday life example"]
preview["App setup preview /"]
landing --> hero
landing --> reviews
landing --> how
landing --> ideas
landing --> features
landing --> teachers
landing --> explore
landing --> faq
landing --> closing
features --> discover
features --> lessons
features --> connection
features --> progress
how --> travel
how --> work
how --> everyday
landing -.->|"Try the preview"| preview
end
style siteMap fill:#F8F5FF,stroke:#B3B3B3
style landing fill:#DCCCFF,stroke:#874FFF
style preview fill:#C2E5FF,stroke:#3DADFF
```

