import test from "node:test";
import assert from "node:assert/strict";
import { fixtureBookings, createSlots, availableSlots } from "../src/learner/model.ts";
import { instantBook } from "../src/learner/storage.ts";
import { attemptComplete, emptyAttempt, preparationFor, preparationBlocks, preparationCounts, preparationStorageKey, readPreparation, savePreparation } from "../src/learner/preparation.ts";

const now = new Date("2026-11-11T08:00:00Z"), booking = fixtureBookings(now)[1];
const preparation = preparationFor(booking), sequence = preparationBlocks(preparation);
function harness() {
  const values = new Map(); let queue = Promise.resolve();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const locks = { request(_key, fn) { const result = queue.then(fn); queue = result.catch(() => {}); return result; } };
  return { values, storage, options: { storage, locks, now } };
}
const finished = block => {
  const attempt = emptyAttempt();
  if (block.purpose === "Teach") { attempt.acknowledged = true; attempt.revealed = block.words.map(word => word.id); }
  else if (block.format === "Vocabulary recall") { for (const word of block.words) attempt.answers[word.id] = word.word; attempt.submitted = block.words.map(word => word.id); attempt.revealed = [...attempt.submitted]; }
  else if (block.format === "Matching pairs") { for (const pair of block.pairs) attempt.answers[pair.id] = pair.right; attempt.submitted = ["activity"]; attempt.revealed = ["activity"]; }
  else if (block.format === "Sentence construction") { attempt.order = block.parts.map(part => part.id); attempt.submitted = ["activity"]; attempt.revealed = ["activity"]; }
  else { attempt.answers.response = "A response to discuss in the session."; attempt.submitted = ["response"]; }
  return attempt;
};
test("the assigned cafe lesson has stable block identities, matches the public outline and excludes private drafts", () => {
  assert.equal(preparation.id, "cafe-a2-v1"); assert.equal(preparation.course.level, "A2");
  assert.equal(preparation.course.modules.length, 6); assert.equal(sequence.length, 9);
  assert.equal(new Set(sequence.map(({ block }) => block.id)).size, 9);
  assert.equal(preparationFor({ teacherId: "gilbert", preparationId: "unknown" }), undefined);
  assert.equal(preparationFor({ teacherId: "diego", preparationId: preparation.id }), undefined);
  assert.equal(preparationFor({ teacherId: "diego" }), undefined);
  assert.ok(!JSON.stringify(preparation).includes('"notes"'));
});
test("completion requires all recall cards, submitted/revealed answers, acknowledged teaching and submitted open responses", () => {
  for (const { block } of sequence) {
    assert.equal(attemptComplete(block, emptyAttempt()), false);
    assert.equal(attemptComplete(block, finished(block)), true, block.format);
  }
  const block = sequence[0].block, half = finished(block);
  half.revealed.pop(); assert.equal(attemptComplete(block, half), false);
  half.revealed.push(block.words[1].id); half.answers[block.words[0].id] = "A wrong answer still counts as an attempted block";
  assert.equal(attemptComplete(block, half), true);
});
test("progress resumes exact drafts and answers, counts only completed blocks and stays isolated by booked session", async () => {
  const h = harness(), block = sequence[0].block, draft = { ...emptyAttempt(), answers: { [block.words[0].id]: "un caf" } };
  await savePreparation(booking, block.id, draft, h.options);
  assert.equal(preparationCounts(preparation, readPreparation(booking, h.options)).completed, 0);
  assert.equal(readPreparation(booking, h.options).blocks[block.id].answers[block.words[0].id], "un caf");
  await savePreparation(booking, block.id, finished(block), h.options);
  assert.equal(preparationCounts(preparation, readPreparation(booking, h.options)).completed, 1);
  assert.deepEqual(readPreparation({ ...booking, id: "a-different-session" }, h.options), { blocks: {} });
  assert.equal(readPreparation({ ...booking, start: "2026-11-13T12:00:00Z" }, h.options).blocks[block.id].completedAt, now.toISOString());
});
test("concurrent block saves preserve each other and all nine blocks are required for preparation complete", async () => {
  const h = harness();
  await Promise.all(sequence.map(({ block }) => savePreparation(booking, block.id, finished(block), h.options)));
  assert.deepEqual(preparationCounts(preparation, readPreparation(booking, h.options)), { completed: 9, total: 9, percent: 100 });
});
test("failed saves and unreadable storage preserve prior work; cancelled and unknown blocks cannot be submitted", async () => {
  const h = harness(), block = sequence[0].block;
  await savePreparation(booking, block.id, finished(block), h.options);
  const before = h.values.get(preparationStorageKey);
  const broken = { ...h.options, storage: { getItem: h.storage.getItem, setItem() { throw new Error("full"); } } };
  await assert.rejects(savePreparation(booking, sequence[1].block.id, finished(sequence[1].block), broken), /could not be saved/);
  assert.equal(h.values.get(preparationStorageKey), before);
  await assert.rejects(savePreparation({ ...booking, status: "cancelled" }, block.id, finished(block), h.options), /unavailable/);
  await assert.rejects(savePreparation(booking, "another-block", finished(block), h.options), /unavailable/);
  h.values.set(preparationStorageKey, "broken");
  await assert.rejects(savePreparation(booking, block.id, finished(block), h.options), /could not be read/);
  assert.equal(h.values.get(preparationStorageKey), "broken");
});
test("new bookings attach the versioned preparation and rescheduling preserves its identity and progress", async () => {
  const h = harness(), slots = createSlots(now), open = availableSlots("gilbert", slots, [], now, { formats: ["Online"] });
  const first = await instantBook({ teacherId: "gilbert", slotId: open[0].id, format: "Online" }, slots, { ...h.options, seed: [] });
  assert.equal(first.preparationId, preparation.id);
  await savePreparation(first, sequence[0].block.id, finished(sequence[0].block), h.options);
  const next = await instantBook({ teacherId: "gilbert", slotId: open[1].id, format: "Online", replaceBookingId: first.id }, slots, h.options);
  assert.equal(next.id, first.id); assert.equal(next.preparationId, first.preparationId);
  assert.equal(preparationCounts(preparation, readPreparation(next, h.options)).completed, 1);
});
