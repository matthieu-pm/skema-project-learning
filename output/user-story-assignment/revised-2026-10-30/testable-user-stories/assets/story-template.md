# [ID] [Explicit title]

Type: Functional user story
Status: [Proposed / agreed / implemented simulation; cite evidence]
Activity and feature: [source reference]
Release or MMF: [source-backed placement or unresolved]

## Description
As a [role], I want [capability], so that [benefit].

## Conversation
Context, evidence, preconditions, scope, exclusions, dependencies, and assumptions.

## Business rules
BR-01 — [Domain constraint; source and status].

## Acceptance criteria
AC-01 — [Observable condition and result; related BR where applicable].

## Acceptance tests
```gherkin
Feature: [User capability]
  @AC01
  Scenario: [Successful concrete example]
    Given [state and explicit fixture data]
    When [action]
    Then [observable expected result]

  @AC02
  Scenario: [Alternative or error example]
    Given [alternative state or failure condition]
    When [action]
    Then [observable result and preserved state]
```

## Traceability
[Source or proposal] → [BR] → [AC] → [AT]. Record uncovered requirements.

## Review
INVEST assessment, unresolved questions, and proposed 3 amigos decisions.
Include the original AI draft and critique when requested. State which tests or
reviews actually ran and which remain specifications or proposals.
For state changes, identify the affected content/revision, acknowledgment and
recovery meaning where relevant. Keep policies without evidence unresolved.
