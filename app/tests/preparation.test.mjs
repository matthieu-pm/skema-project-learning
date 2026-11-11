import test from "node:test";
import assert from "node:assert/strict";
import {
  preparationAnswerLimit,
  preparationBlockComplete,
  preparationForBooking,
  preparationForLesson,
  preparationStorageKey,
  readPreparation,
  savePreparationBlock,
  subscribePreparation,
} from "../src/learner/preparation.ts";

const now = new Date("2026-11-11T08:00:00.000Z");
const booking = {
  id: "session-one", teacherId: "gilbert", status: "confirmed", preparationId: "gilbert-cafe-v1",
  slotId: "slot-one", start: "2026-11-12T09:00:00.000Z", end: "2026-11-12T09:30:00.000Z",
  format: "Online", paymentStatus: "paid", rate: 30, duration: 30,
};
const preparation = preparationForBooking(booking);
const activities = preparation.course.modules.flatMap(module => module.blocks);
const recall = activities.find(block => block.format === "Vocabulary recall");
const writing = activities.find(block => block.format === "Written response");
const teaching = activities.find(block => block.purpose === "Teach");
const fullRecall = Object.fromEntries(recall.words.map(word => [word.id, word.word]));

function harness() {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  let queue = Promise.resolve();
  const locks = { request(_name, work) { const result = queue.then(work); queue = result.catch(() => {}); return result; } };
  return { values, options: { storage, locks, now } };
}

test("public preparation is stable, independently cloned and matches the six-module nine-block outline", () => {
  const first = preparationForLesson("gilbert", "gilbert-cafe");
  const second = preparationForLesson("gilbert");
  assert.deepEqual(first, second);
  assert.equal(first.id, "gilbert-cafe-v1");
  assert.equal(first.version, 1);
  assert.equal(first.course.level, "A2");
  assert.match(first.course.goal, /natural follow-up question/);
  assert.equal(first.course.modules.length, 6);
  assert.equal(first.course.modules.reduce((sum, module) => sum + module.minutes, 0), 30);
  assert.equal(activities.length, 9);
  const ids = first.course.modules.flatMap(module => [module.id, ...module.blocks.flatMap(block => [block.id,
    ...[block.words, block.parts, block.pairs, block.clips].flatMap(items => items.map(item => item.id))])]);
  assert.equal(new Set(ids).size, ids.length);
  first.course.modules[0].blocks[0].words[0].word = "A changed copy";
  assert.notEqual(second.course.modules[0].blocks[0].words[0].word, "A changed copy");
  assert.deepEqual(preparationForLesson("gilbert"), second);
});

test("preparation binding accepts only the known teacher/course and confirmed assigned or legacy bookings", () => {
  assert.equal(preparationForLesson("diego"), undefined);
  assert.equal(preparationForLesson("gilbert", "unknown-course"), undefined);
  assert.equal(preparationForBooking({ ...booking, teacherId: "diego" }), undefined);
  assert.equal(preparationForBooking({ ...booking, status: "cancelled" }), undefined);
  assert.equal(preparationForBooking({ ...booking, preparationId: "another-assignment" }), undefined);
  assert.equal(preparationForBooking({ ...booking, preparationId: "" }), undefined);
  const { preparationId, ...legacy } = booking;
  assert.deepEqual(preparationForBooking(legacy), preparationForBooking(booking));
  assert.equal(preparationForBooking({ ...booking, id: "" }), undefined);
});

test("two sessions keep independent progress and a reschedule retains the same booking identity", async () => {
  const h = harness();
  const other = { ...booking, id: "session-two" };
  await savePreparationBlock(booking, writing.id, { response: "My first session" }, true, h.options);
  assert.deepEqual(readPreparation(other, h.options).blocks, {});
  await savePreparationBlock(other, writing.id, { response: "My second session" }, false, h.options);
  const moved = { ...booking, slotId: "new-slot", start: "2026-11-13T14:00:00.000Z", end: "2026-11-13T14:30:00.000Z" };
  assert.equal(readPreparation(moved, h.options).blocks[writing.id].answers.response, "My first session");
  assert.equal(readPreparation(other, h.options).blocks[writing.id].answers.response, "My second session");
  const raw = h.values.get(preparationStorageKey);
  const cancelled = { ...moved, status: "cancelled" };
  assert.throws(() => readPreparation(cancelled, h.options), /not available/);
  await assert.rejects(savePreparationBlock(cancelled, writing.id, { response: "Changed" }, true, h.options), /not available/);
  assert.equal(h.values.get(preparationStorageKey), raw);
  assert.equal(readPreparation(moved, h.options).blocks[writing.id].completedAt, now.toISOString());
  assert.equal(booking.rate, 30);
  assert.equal(booking.duration, 30);
});

test("a partial draft reloads exact typed text without claiming completion", async () => {
  const h = harness();
  const draft = { [recall.words[0].id]: "  un caf  " };
  const progress = await savePreparationBlock(booking, recall.id, draft, false, h.options);
  assert.equal(progress.bookingId, booking.id);
  assert.deepEqual(readPreparation(booking, h.options).blocks[recall.id], { answers: draft });
  progress.blocks[recall.id].answers[recall.words[0].id] = "Changed returned copy";
  assert.deepEqual(readPreparation(booking, h.options).blocks[recall.id].answers, draft);
});

test("completion requires every practice answer but does not require a correct answer", async () => {
  const h = harness();
  for (const block of activities.filter(block => block.purpose === "Practice")) {
    assert.equal(preparationBlockComplete(block, {}), false);
    await assert.rejects(savePreparationBlock(booking, block.id, {}, true, h.options), /Complete every answer/);
  }
  const firstOnly = { [recall.words[0].id]: "un café" };
  await assert.rejects(savePreparationBlock(booking, recall.id, firstOnly, true, h.options), /Complete every answer/);
  const pairs = activities.find(block => block.purpose === "Practice" && block.format === "Matching pairs");
  await assert.rejects(savePreparationBlock(booking, pairs.id, { [pairs.pairs[0].id]: "a coffee" }, true, h.options), /Complete every answer/);
  await assert.rejects(savePreparationBlock(booking, writing.id, { response: "   " }, true, h.options), /Complete every answer/);
  const attempted = Object.fromEntries(recall.words.map(word => [word.id, "An incorrect attempt"]));
  const result = await savePreparationBlock(booking, recall.id, attempted, true, h.options);
  assert.equal(result.blocks[recall.id].completedAt, now.toISOString());
  assert.deepEqual(result.blocks[recall.id].answers, attempted);
});

test("teaching completion is explicit and saved completion is invalidated only when answers change", async () => {
  const h = harness();
  await savePreparationBlock(booking, teaching.id, {}, false, h.options);
  assert.equal(readPreparation(booking, h.options).blocks[teaching.id].completedAt, undefined);
  await savePreparationBlock(booking, teaching.id, {}, true, h.options);
  assert.equal(readPreparation(booking, h.options).blocks[teaching.id].completedAt, now.toISOString());
  await savePreparationBlock(booking, recall.id, fullRecall, true, h.options);
  await savePreparationBlock(booking, recall.id, fullRecall, false, h.options);
  assert.equal(readPreparation(booking, h.options).blocks[recall.id].completedAt, now.toISOString());
  const changed = { ...fullRecall, [recall.words[0].id]: "An edited answer" };
  const result = await savePreparationBlock(booking, recall.id, changed, false, h.options);
  assert.equal(result.blocks[recall.id].completedAt, undefined);
  assert.deepEqual(readPreparation(booking, h.options).blocks[recall.id].answers, changed);
});

test("unknown response fields, invalid value types and excessive strings cannot change saved work", async () => {
  const h = harness();
  for (const answers of [{ unknown: "hello" }, { response: 7 }, { response: "x".repeat(preparationAnswerLimit + 1) }, [], null]) {
    await assert.rejects(savePreparationBlock(booking, writing.id, answers, false, h.options), /could not be saved/);
  }
  await assert.rejects(savePreparationBlock(booking, "not-a-block", {}, false, h.options), /could not be saved/);
  await assert.rejects(savePreparationBlock(booking, recall.id, { response: "wrong key shape" }, false, h.options), /could not be saved/);
  assert.equal(h.values.size, 0);
  await savePreparationBlock(booking, writing.id, { response: "x".repeat(preparationAnswerLimit) }, false, h.options);
  assert.equal(readPreparation(booking, h.options).blocks[writing.id].answers.response.length, preparationAnswerLimit);
});

test("unreadable or corrupt progress is preserved and blocks saving instead of being overwritten", async () => {
  const h = harness();
  const progress = { bookingId: booking.id, preparationId: preparation.id, version: 1, blocks: {} };
  const badProgress = [
    { ...progress, version: 2 },
    { ...progress, preparationId: "unknown" },
    { ...progress, blocks: { unknown: { answers: {} } } },
    { ...progress, blocks: { [writing.id]: { answers: { response: 8 } } } },
    { ...progress, blocks: { [writing.id]: { answers: {}, completedAt: now.toISOString() } } },
    { ...progress, blocks: { [writing.id]: { answers: { response: "Hello" }, completedAt: "invalid date" } } },
  ];
  const corrupt = ["broken JSON", "null", "[]", '{"version":2,"progress":[]}',
    ...badProgress.map(record => JSON.stringify({ version: 1, progress: [record] })),
    JSON.stringify({ version: 1, progress: [progress, progress] })];
  for (const raw of corrupt) {
    h.values.set(preparationStorageKey, raw);
    assert.throws(() => readPreparation(booking, h.options), /could not be read.*Reload/);
    await assert.rejects(savePreparationBlock(booking, writing.id, { response: "Safe answer" }, true, h.options), /could not be read/);
    assert.equal(h.values.get(preparationStorageKey), raw);
  }
  let writes = 0;
  const storage = { getItem() { throw new Error("Blocked"); }, setItem() { writes++; } };
  assert.throws(() => readPreparation(booking, { storage }), /could not be read/);
  await assert.rejects(savePreparationBlock(booking, writing.id, { response: "Kept draft" }, true, { storage }), /could not be read/);
  assert.equal(writes, 0);
});

test("a failed write does not acknowledge completion or replace the previously saved draft", async () => {
  const h = harness();
  await savePreparationBlock(booking, writing.id, { response: "Draft" }, false, h.options);
  const raw = h.values.get(preparationStorageKey);
  const storage = { getItem: h.options.storage.getItem, setItem() { throw new Error("Quota exceeded"); } };
  await assert.rejects(savePreparationBlock(booking, writing.id, { response: "Completed answer" }, true, { ...h.options, storage }), /could not be saved.*try again/);
  assert.equal(h.values.get(preparationStorageKey), raw);
  assert.equal(readPreparation(booking, h.options).blocks[writing.id].completedAt, undefined);
});

for (const locked of [true, false]) {
  test(`concurrent saves preserve other blocks and sessions ${locked ? "with" : "without"} Web Locks`, async () => {
    const h = harness();
    const options = { ...h.options, locks: locked ? h.options.locks : null };
    const other = { ...booking, id: "second-session" };
    const draft = { response: "Written first" };
    const pending = savePreparationBlock(booking, writing.id, draft, false, options);
    draft.response = "Caller changed after save request";
    await Promise.all([pending,
      savePreparationBlock(booking, recall.id, fullRecall, true, options),
      savePreparationBlock(other, writing.id, { response: "Other session" }, true, options)]);
    const current = readPreparation(booking, options);
    assert.equal(Object.keys(current.blocks).length, 2);
    assert.equal(current.blocks[writing.id].answers.response, "Written first");
    assert.equal(current.blocks[recall.id].completedAt, now.toISOString());
    assert.equal(readPreparation(other, options).blocks[writing.id].answers.response, "Other session");
  });
}

test("preparation subscribers receive only preparation changes and can unsubscribe", async () => {
  const original = globalThis.window;
  const target = new EventTarget();
  globalThis.window = target;
  try {
    let calls = 0;
    const unsubscribe = subscribePreparation(() => calls++);
    const h = harness();
    await savePreparationBlock(booking, writing.id, { response: "Saved" }, false, h.options);
    assert.equal(calls, 1);
    for (const key of ["unrelated", preparationStorageKey, null]) {
      const event = new Event("storage");
      Object.defineProperty(event, "key", { value: key });
      target.dispatchEvent(event);
    }
    assert.equal(calls, 3);
    unsubscribe();
    await savePreparationBlock(booking, writing.id, { response: "Later" }, false, h.options);
    assert.equal(calls, 3);
  } finally {
    if (original === undefined) delete globalThis.window;
    else globalThis.window = original;
  }
});
