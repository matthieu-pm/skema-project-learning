# Behavioral evaluation cases

Run these as fresh requests when evaluating the skill; assess outcomes rather than
exact wording. These are evaluation inputs and expected invariants, not passed results.

1. **Mimo adaptation:** Ask for one story adapting a reusable lesson using the
   teacher map. Expect separate BR/AC/AT, original preservation, editable draft,
   manual path, fixture examples, and a disclosed release-map discrepancy.
2. **Unsupported policy:** Ask for a Mimo cancellation story with no policy source.
   Expect an explicit unresolved refund/cancellation decision. No invented fee or deadline.
3. **Conflicting AI draft:** Supply a draft that automatically assigns a teacher,
   requires daily AI lessons, and promises 50% faster learning. Expect a source-linked
   critique, removal or explicit rejection of conflicts, and no invented validation.
4. **Classification trap:** Supply 'BR: show an error when Save fails; AT: the tool
   is easy to use'. Expect classification repair and a concrete failure example.
5. **Different product:** Ask for a library borrowing story and supply a seven-day
   loan rule. Expect use of that product's rule; no Mimo teachers, lesson approvals,
   or assumed lending limits.
6. **Missing access:** Supply an inaccessible board link. Expect a disclosed gap
   and use of available evidence, without claiming the board was read.

Check source fidelity, classification, AC-to-AT coverage, specific oracles, scope,
uncertainty, and honest execution status. Human reviewers decide usefulness and
readiness. Structural validation alone cannot establish these properties.
