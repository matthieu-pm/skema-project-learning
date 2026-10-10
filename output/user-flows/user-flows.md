# Mimo user flows

Created 9 October 2026. One flow = one goal.

[Open FigJam collection](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=440-2676)

## L1 · Set my learning goal

- Role: Learner
- Status: Current prototype
- Entry: Learner setup after account and any guardian handoff
- Boundary: Local page-session state only. Account and guardian checks are simulated.
- [FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=428-2182)

```mermaid
flowchart LR
subgraph flowL1 ["L1 · Learner · Set my learning goal · Current prototype"]
start(["Language selection"]) --> langs["Choose languages"]
langs --> level["Set one language level"]
level --> more{"Another language?"}
more -->|"Yes"| level
more -->|"No"| topic["Choose learning context"]
topic --> goal["Write personal goal"]
goal --> valid{"At least 3 characters?"}
valid -->|"No"| goal
valid -->|"Yes"| resource{"Add a resource?"}
resource -->|"Yes"| attach["Choose local file"]
resource -->|"No"| done(["Goal captured locally"])
attach --> done
end
style flowL1 fill:#F8F5FF,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
style start fill:#D9D9D9,stroke:#B3B3B3
```

## L2 · Set my meeting preferences

- Role: Learner
- Status: Current prototype
- Entry: After learning goal and encouragement
- Boundary: Online skips city. Days and times can stay flexible; no daily target.
- [FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=430-2226)

```mermaid
flowchart LR
subgraph flowL2 ["L2 · Learner · Set my meeting preferences · Current prototype"]
start(["Preferences introduction"]) --> format{"Meeting format?"}
format -->|"Online"| days["Choose days or defer"]
format -->|"City needed"| city["Enter city or defer"]
city --> days
days --> time["Choose time or defer"]
time --> done(["Preferences captured locally"])
end
style flowL2 fill:#F8F5FF,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
style start fill:#D9D9D9,stroke:#B3B3B3
```

## L3 · Choose a suitable teacher

- Role: Learner
- Status: Proposed
- Entry: Learning home with goal brief
- Boundary: Learner chooses the teacher. No automatic assignment or assumed public ratings.
- [FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=431-2265)

```mermaid
flowchart LR
subgraph flowL3 ["L3 · Learner · Choose a suitable teacher · Proposed"]
start(["Learning home"]) --> explore["Open Explore"]
explore --> filters["Set relevant filters"]
filters --> results{"Teachers available?"}
results -->|"No"| adjust["Adjust filters"]
adjust --> filters
results -->|"Yes"| profile["Open teacher profile"]
profile --> fit{"Fits my goal?"}
fit -->|"No"| explore
fit -->|"Yes"| preview["Review lesson preview"]
preview --> done(["Teacher chosen"])
end
style flowL3 fill:#F8F5FF,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
style start fill:#D9D9D9,stroke:#B3B3B3
```

## L4 · Book one lesson

- Role: Learner
- Status: Proposed
- Entry: Chosen teacher and lesson
- Boundary: Price, fees and cancellation rules remain undecided. Pending payment is not failure.
- [FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=432-2319)

```mermaid
flowchart LR
subgraph flowL4 ["L4 · Learner · Book one lesson · Proposed"]
start(["Chosen teacher"]) --> brief["Review goal brief"]
brief --> format["Choose format"]
format --> slot["Choose time and place"]
slot --> available{"Slot still available?"}
available -->|"No"| slot
available -->|"Yes"| review["Review total and terms"]
review --> pay["Confirm payment"]
pay --> result{"Payment status?"}
result -->|"Confirmed"| done(["Booking confirmed"])
result -->|"Failed"| method["Change payment method"]
method --> pay
result -->|"Pending"| wait["Check existing payment"]
wait --> result
end
style flowL4 fill:#F8F5FF,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
style start fill:#D9D9D9,stroke:#B3B3B3
```

## L5 · Reschedule a lesson

- Role: Learner
- Status: Proposed
- Entry: An existing upcoming booking
- Boundary: Any eligibility or fee rules need definition. Keep the original booking until change confirmation.
- [FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=433-2377)

```mermaid
flowchart LR
subgraph flowL5 ["L5 · Learner · Reschedule a lesson · Proposed"]
start(["Upcoming session"]) --> detail["Open session details"]
detail --> change["Choose reschedule"]
change --> terms["Review applicable terms"]
terms --> slot["Choose new slot"]
slot --> available{"Slot available?"}
available -->|"No"| slot
available -->|"Yes"| confirm["Confirm change"]
confirm --> saved{"Change confirmed?"}
saved -->|"Yes"| done(["New time confirmed"])
saved -->|"No"| retry["Original booking retained"]
retry --> slot
end
style flowL5 fill:#F8F5FF,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
style start fill:#D9D9D9,stroke:#B3B3B3
```

## L6 · Join my online lesson

- Role: Learner
- Status: Proposed
- Entry: A confirmed online booking
- Boundary: One learner and one chosen teacher. Connection and permissions are not implemented.
- [FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=434-2430)

```mermaid
flowchart LR
subgraph flowL6 ["L6 · Learner · Join my online lesson · Proposed"]
start(["Upcoming online session"]) --> details["Open session"]
details --> lobby["Enter lobby"]
lobby --> check["Check microphone and camera"]
check --> ready{"Devices ready?"}
ready -->|"No"| settings["Adjust permissions"]
settings --> check
ready -->|"Yes"| join["Join lesson"]
join --> connected{"Connected?"}
connected -->|"Yes"| done(["In one-to-one lesson"])
connected -->|"No"| reconnect["Reconnect"]
reconnect --> join
end
style flowL6 fill:#F8F5FF,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
style start fill:#D9D9D9,stroke:#B3B3B3
```

## L7 · Submit a practice response

- Role: Learner
- Status: Proposed
- Entry: A teacher-provided practice activity
- Boundary: Practice is optional. A failed upload stays a draft; it is not shown as submitted.
- [FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=435-2480)

```mermaid
flowchart LR
subgraph flowL7 ["L7 · Learner · Submit a practice response · Proposed"]
start(["Practice hub"]) --> task["Open assigned activity"]
task --> material["Review supporting material"]
material --> response["Create response"]
response --> preview["Review response"]
preview --> submit["Submit to teacher"]
submit --> sent{"Submission confirmed?"}
sent -->|"Yes"| done(["Response submitted"])
sent -->|"No"| draft["Keep response draft"]
draft --> submit
end
style flowL7 fill:#F8F5FF,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
style start fill:#D9D9D9,stroke:#B3B3B3
```

## T1 · Create my teaching profile draft

- Role: Teacher
- Status: Current prototype
- Entry: Teacher introduction after the simulated account step
- Boundary: Stops at profile review. Identity preview is a separate next goal; no profile is published.
- [FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=436-2534)

```mermaid
flowchart LR
subgraph flowT1 ["T1 · Teacher · Create my teaching profile draft · Current prototype"]
start(["Teacher introduction"]) --> name["Enter display name"]
name --> media["Add media or skip"]
media --> langs["Select teaching languages"]
langs --> levels["Select teaching levels"]
levels --> approach["Describe teaching approach"]
approach --> format{"Meeting format?"}
format -->|"Online"| duration["Choose lesson duration"]
format -->|"City needed"| city["Enter city"]
city --> duration
duration --> rate["Set lesson rate"]
rate --> review["Review profile"]
review --> done(["Local profile draft ready"])
end
style flowT1 fill:#F5FBFF,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
style start fill:#D9D9D9,stroke:#B3B3B3
```

## T2 · Prepare a lesson for one learner

- Role: Teacher
- Status: Proposed
- Entry: A booked learner and their goal brief
- Boundary: Short editable blocks. AI is optional; the teacher reviews and approves all content.
- [FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=437-2591)

```mermaid
flowchart LR
subgraph flowT2 ["T2 · Teacher · Prepare a lesson for one learner · Proposed"]
start(["Learner detail"]) --> brief["Read learner goal"]
brief --> base["Choose reusable lesson"]
base --> mode{"Use AI assistance?"}
mode -->|"No"| edit["Adapt lesson blocks"]
mode -->|"Yes"| generate["Request optional draft"]
generate --> result{"Draft available?"}
result -->|"No"| edit
result -->|"Yes"| review["Review generated content"]
review --> edit
edit --> preview["Preview learner view"]
preview --> ready{"Ready to teach?"}
ready -->|"No"| edit
ready -->|"Yes"| done(["Lesson approved for use"])
end
style flowT2 fill:#F5FBFF,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
style start fill:#D9D9D9,stroke:#B3B3B3
```

## T3 · Share a lesson recap

- Role: Teacher
- Status: Proposed
- Entry: A completed one-to-one lesson
- Boundary: Teacher is the final reviewer. Failed sharing preserves a draft; feedback stays private.
- [FigJam flow](https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=438-2652)

```mermaid
flowchart LR
subgraph flowT3 ["T3 · Teacher · Share a lesson recap · Proposed"]
start(["Completed lesson"]) --> notes["Open session notes"]
notes --> draft["Draft concise recap"]
draft --> edit["Edit observations"]
edit --> practice["Add optional next practice"]
practice --> review["Review learner version"]
review --> ready{"Ready to share?"}
ready -->|"No"| edit
ready -->|"Yes"| share["Share with learner"]
share --> sent{"Share confirmed?"}
sent -->|"Yes"| done(["Private recap shared"])
sent -->|"No"| keep["Keep recap draft"]
keep --> share
end
style flowT3 fill:#F5FBFF,stroke:#B3B3B3
style done fill:#CDF4D3,stroke:#66D575
style start fill:#D9D9D9,stroke:#B3B3B3
```

