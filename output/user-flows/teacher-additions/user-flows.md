# Additional teacher user flows

Created 9 October 2026. One goal per flow.

[FigJam collection](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=466-3308)

Added beside the user-rearranged teacher section; its existing content was preserved. Proposed behavior is not implemented. Identity is only the current simulated preview, and payout policies remain open.

## T4 · Set my availability

Status: Proposed

Entry: Teacher profile is ready

Boundary: Every slot is one-to-one. Changing availability must preserve existing bookings.

[FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=452-2685)

```mermaid
flowchart LR
subgraph flowT4 ["T4 · Set my availability"]
start(["Teacher workspace"]) --> open["Open availability"]
open --> zone["Check time zone"]
zone --> hours["Choose teaching hours"]
hours --> conflicts{"Any conflicts?"}
conflicts -->|"Yes"| adjust["Adjust open slots"]
adjust --> hours
conflicts -->|"No"| save["Save availability"]
save --> result{"Saved?"}
result -->|"Yes"| done(["Availability published"])
result -->|"No"| retry["Keep edits and retry"]
retry --> save
end
style flowT4 fill:#F5FBFF,stroke:#B3B3B3
style start fill:#D9D9D9,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
```

## T5 · Share a prepared lesson

Status: Proposed

Entry: An approved lesson for one chosen learner

Boundary: Check the recipient and learner view. Keep private notes private and preserve past lesson versions.

[FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=453-2743)

```mermaid
flowchart LR
subgraph flowT5 ["T5 · Share a prepared lesson"]
start(["Approved lesson"]) --> learner["Check chosen learner"]
learner --> preview["Preview learner version"]
preview --> ready{"Ready to share?"}
ready -->|"No"| edit["Edit visible material"]
edit --> preview
ready -->|"Yes"| share["Share lesson"]
share --> sent{"Shared?"}
sent -->|"Yes"| done(["Learner can access lesson"])
sent -->|"No"| draft["Keep unshared draft"]
draft --> share
end
style flowT5 fill:#F5FBFF,stroke:#B3B3B3
style start fill:#D9D9D9,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
```

## T6 · Teach an online lesson

Status: Proposed

Entry: A confirmed online session

Boundary: One teacher and one learner. If the learner does not arrive, use the separate no-show flow.

[FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=454-2799)

```mermaid
flowchart LR
subgraph flowT6 ["T6 · Teach an online lesson"]
start(["Upcoming session"]) --> lobby["Open session lobby"]
lobby --> devices["Check microphone and camera"]
devices --> join["Join session"]
join --> online{"Connected?"}
online -->|"No"| retry["Reconnect"]
retry --> join
online -->|"Yes"| lesson["Open prepared lesson"]
lesson --> teach["Guide learner activity"]
teach --> feedback["Give human feedback"]
feedback --> finish["End session"]
finish --> done(["Lesson completed"])
end
style flowT6 fill:#F5FBFF,stroke:#B3B3B3
style start fill:#D9D9D9,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
```

## T7 · Review a learner submission

Status: Proposed

Entry: A submitted recording or written response

Boundary: Teacher review works without AI. Final feedback is private and teacher-approved.

[FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=455-2848)

```mermaid
flowchart LR
subgraph flowT7 ["T7 · Review a learner submission"]
start(["Work to review"]) --> open["Open submission"]
open --> inspect["Read or play response"]
inspect --> feedback["Write useful feedback"]
feedback --> review["Review final feedback"]
review --> share["Share with learner"]
share --> sent{"Shared?"}
sent -->|"Yes"| done(["Learner receives feedback"])
sent -->|"No"| draft["Keep feedback draft"]
draft --> share
end
style flowT7 fill:#F5FBFF,stroke:#B3B3B3
style start fill:#D9D9D9,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
```

## T8 · Create a reusable lesson

Status: Proposed

Entry: Teacher lesson library

Boundary: Short modular lessons, not long courses. Saving to the library does not share with a learner.

[FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=456-2898)

```mermaid
flowchart LR
subgraph flowT8 ["T8 · Create a reusable lesson"]
start(["Lesson library"]) --> newLesson["Start new lesson"]
newLesson --> outcome["Define lesson outcome"]
outcome --> level["Choose language and level"]
level --> blocks["Add short activity blocks"]
blocks --> preview["Preview lesson"]
preview --> ready{"Ready to save?"}
ready -->|"No"| blocks
ready -->|"Yes"| save["Save to library"]
save --> done(["Reusable lesson saved"])
end
style flowT8 fill:#F5FBFF,stroke:#B3B3B3
style start fill:#D9D9D9,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
```

## T9 · Adapt a saved lesson

Status: Proposed

Entry: A saved lesson and a learner goal brief

Boundary: Creates a learner-specific draft. Keep the original reusable lesson and previous session versions.

[FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=457-2946)

```mermaid
flowchart LR
subgraph flowT9 ["T9 · Adapt a saved lesson"]
start(["Saved lesson"]) --> learner["Choose learner"]
learner --> brief["Read goal and level"]
brief --> copy["Create learner version"]
copy --> edit["Adapt activity blocks"]
edit --> preview["Preview learner version"]
preview --> fit{"Fits learner goal?"}
fit -->|"No"| edit
fit -->|"Yes"| save["Save adapted draft"]
save --> done(["Learner-specific draft saved"])
end
style flowT9 fill:#F5FBFF,stroke:#B3B3B3
style start fill:#D9D9D9,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
```

## T10 · Reschedule a session

Status: Proposed

Entry: An upcoming confirmed session

Boundary: Keep the original booking until replacement confirmation. Agreement rules and charges remain open.

[FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=458-2994)

```mermaid
flowchart LR
subgraph flowT10 ["T10 · Reschedule a session"]
start(["Upcoming session"]) --> open["Open session details"]
open --> terms["Review change terms"]
terms --> slot["Choose replacement time"]
slot --> valid{"Time available?"}
valid -->|"No"| slot
valid -->|"Yes"| confirm["Confirm change"]
confirm --> result{"Change confirmed?"}
result -->|"Yes"| done(["New time confirmed"])
result -->|"No"| retained["Original booking retained"]
retained --> slot
end
style flowT10 fill:#F5FBFF,stroke:#B3B3B3
style start fill:#D9D9D9,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
```

## T11 · Cancel a session

Status: Proposed

Entry: An upcoming booking

Boundary: Show the actual applicable consequences before confirmation. Fees, refunds and deadlines are undecided.

[FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=459-3042)

```mermaid
flowchart LR
subgraph flowT11 ["T11 · Cancel a session"]
start(["Upcoming session"]) --> open["Open session details"]
open --> cancel["Choose cancellation"]
cancel --> terms["Review consequences"]
terms --> proceed{"Cancel session?"}
proceed -->|"No"| keep(["Booking unchanged"])
proceed -->|"Yes"| submit["Submit cancellation"]
submit --> confirmed{"Cancelled?"}
confirmed -->|"Yes"| done(["Cancellation confirmed"])
confirmed -->|"No"| status["Check booking status"]
status --> submit
end
style flowT11 fill:#F5FBFF,stroke:#B3B3B3
style start fill:#D9D9D9,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
```

## T12 · Report a learner no-show

Status: Proposed

Entry: A scheduled session where the learner has not arrived

Boundary: The outcome is a recorded issue and next step, not a refund or fault decision. Waiting thresholds remain open.

[FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=460-3089)

```mermaid
flowchart LR
subgraph flowT12 ["T12 · Report a learner no-show"]
start(["Learner has not arrived"]) --> session["Check session details"]
session --> message["Message learner"]
message --> arrived{"Learner arrives?"}
arrived -->|"Yes"| resume(["Continue scheduled lesson"])
arrived -->|"No"| report["Open session issue"]
report --> details["Describe what happened"]
details --> submit["Submit issue"]
submit --> done(["Issue recorded with next step"])
end
style flowT12 fill:#F5FBFF,stroke:#B3B3B3
style start fill:#D9D9D9,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
```

## T13 · Message a learner

Status: Proposed

Entry: An existing learner or session conversation

Boundary: Private lesson communication. A failed send remains an editable draft and is never shown as delivered.

[FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=462-3128)

```mermaid
flowchart LR
subgraph flowT13 ["T13 · Message a learner"]
start(["Teacher inbox"]) --> conversation["Open learner conversation"]
conversation --> compose["Write message"]
compose --> review["Check recipient and content"]
review --> send["Send message"]
send --> sent{"Delivered?"}
sent -->|"Yes"| done(["Message delivered"])
sent -->|"No"| draft["Keep editable draft"]
draft --> send
end
style flowT13 fill:#F5FBFF,stroke:#B3B3B3
style start fill:#D9D9D9,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
```

## T14 · Update my teaching profile

Status: Proposed

Entry: An existing teaching profile

Boundary: Public teaching details are separate from legal identity data. Existing booking terms are preserved.

[FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=463-3171)

```mermaid
flowchart LR
subgraph flowT14 ["T14 · Update my teaching profile"]
start(["Teacher profile"]) --> edit["Choose edit profile"]
edit --> details["Update teaching details"]
details --> preview["Preview public profile"]
preview --> correct{"Details correct?"}
correct -->|"No"| details
correct -->|"Yes"| save["Save changes"]
save --> saved{"Saved?"}
saved -->|"Yes"| done(["Profile updated"])
saved -->|"No"| retry["Keep edits and retry"]
retry --> save
end
style flowT14 fill:#F5FBFF,stroke:#B3B3B3
style start fill:#D9D9D9,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
```

## T15 · Complete the identity preview

Status: Current simulated prototype

Entry: Teacher profile review

Boundary: No real identity check, camera, upload or Persona connection. Identity is separate from teaching qualification.

[FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=464-3231)

```mermaid
flowchart LR
subgraph flowT15 ["T15 · Complete the identity preview"]
start(["Identity introduction"]) --> path{"Choose route"}
path -->|"Later"| later(["Local teacher draft"])
path -->|"Persona"| persona["Confirm sample link"]
persona --> done(["Identity preview completed"])
path -->|"Document"| name["Enter legal name"]
name --> birth["Enter date of birth"]
birth --> country["Choose issuing country"]
country --> type["Choose document type"]
type --> document["Use sample document"]
document --> selfie["Use sample selfie"]
selfie --> done
end
style flowT15 fill:#F5FBFF,stroke:#B3B3B3
style start fill:#D9D9D9,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
```

## T16 · Receive a payout

Status: Concept · policies open

Entry: Earnings from completed paid sessions

Boundary: Provider, fees, timing and automatic versus requested payouts are undecided. Pending is not failed; never duplicate a transfer.

[FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=465-3279)

```mermaid
flowchart LR
subgraph flowT16 ["T16 · Receive a payout"]
start(["Teacher earnings"]) --> details["Open payout details"]
details --> setup{"Payout setup ready?"}
setup -->|"No"| provider["Complete provider setup"]
provider --> details
setup -->|"Yes"| track["Check payout status"]
track --> status{"Transfer status?"}
status -->|"Paid"| done(["Payout received"])
status -->|"Pending"| wait["Wait for status update"]
wait --> track
status -->|"Action needed"| fix["Follow provider instructions"]
fix --> track
end
style flowT16 fill:#F5FBFF,stroke:#B3B3B3
style start fill:#D9D9D9,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
```

