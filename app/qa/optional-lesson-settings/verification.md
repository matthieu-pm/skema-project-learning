# Optional lesson settings — 5 November 2026

## Screen counts

Baseline commit 9578ac9; email, in-person, document-based identity path; one language for the adult learner. Count actual displayed pages, including welcome/role/account and email-code verification. Identity checking is counted separately.

| Teacher flow | Original | Updated |
| --- | ---: | ---: |
| Setup through profile review | 18 | 8 |
| Document-based identity preview | 7 | 5 |
| Standalone completion page | 1 | 0 |
| Total | 26 | 13 |

Teacher identity can be deferred: eight screens to the workspace. The terminal verification-ready route still exists in the updated route array but opens the workspace directly rather than showing another completion page. Adult learner equivalent total is 29 → 16, including its retained final summary. Guardian and additional-language branches vary. Free confirmation is inline and adds no page.

## Verification

- Production build, 28 protected runtime hashes, 20 onboarding / 28 teacher / 5 routing / 4 Sites tests passed (57 tests).
- Desktop: blank settings permit continuation; unconfirmed €0 disables Continue; confirming enables it. Deferring clears the provisional price and review/profile display Not set.
- Profile → Lesson settings retains missing values, supports independently optional fields, reviews and saves confirmed €0 as Free (€0). Editing paid price and returning to €0 resets confirmation and disables review.
- Incomplete drafts can be saved. Availability shows a clear recovery action and disables Save availability when price is missing.
- Phone: email/Google actions form one vertical group with visible separator, inside the source iPhone runtime; no separated bottom-left Google action or overlapping footer.
- Published version 9 shows Lesson settings and disables review for unconfirmed free pricing.
- No real authentication, charging, booking service or cross-device profile persistence is connected. Existing sample bookings are preserved. No new live microphone, physical-device or assistive-technology study performed.

## Publication

Version 9: source 7fa660cbaf7337df54ef4f5fa9d36b7991a62e77; saved version appgprj_6aec12084dfc8191add134139ef2dd4a~appgver_9d8c296a136c81918bfefc73628597a4; deployment appgdep_6aecee83223c8191ace3401f0700dbea succeeded. Same public review URL and audience. The original project and fork main remain unchanged.
