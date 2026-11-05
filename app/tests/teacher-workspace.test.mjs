import test from "node:test";
import assert from "node:assert/strict";
import {
  initialLessons,
  initialSessions,
  students,
  overlaps,
  adaptLesson,
  learnerMaterial,
  lessonValid,
  initialProfile,
  primaryTab,
} from "../src/teacher/model.ts";
import { initialAnswers } from "../src/onboarding.ts";
test("adjacent bookings fit, overlapping confirmed bookings do not, and inactive sessions release time", () => {
  const ss = initialSessions();
  assert.equal(overlaps(ss, "2026-10-10", "14:15", 30), true);
  assert.equal(overlaps(ss, "2026-10-10", "13:45", 30), true);
  assert.equal(overlaps(ss, "2026-10-10", "14:30", 30), false);
  assert.equal(overlaps(ss, "2026-10-10", "13:30", 30), false);
  assert.equal(overlaps(ss, "2026-10-10", "14:00", 30, "s1"), false);
  assert.equal(overlaps(ss, "2026-10-08", "14:00", 30), false);
  assert.equal(
    overlaps(
      ss.map((s) => (s.id === "s1" ? { ...s, status: "Cancelled" } : s)),
      "2026-10-10",
      "14:00",
      30,
    ),
    false,
  );
});
test("adapting for one learner preserves the reusable original and creates independent activity blocks", () => {
  const source = initialLessons()[0],
    before = structuredClone(source),
    copy = adaptLesson(source, students[2]);
  assert.equal(copy.studentId, "maya");
  assert.equal(copy.level, "B2");
  assert.equal(copy.outcome, students[2].goal);
  assert.equal(copy.status, "Draft");
  assert.equal(copy.sourceId, source.id);
  assert.notEqual(copy.id, source.id);
  copy.blocks[0].content = "A new learner-specific prompt";
  assert.deepEqual(source, before);
  assert.notEqual(copy.blocks[0].id, source.blocks[0].id);
});
test("shared learner material excludes teaching notes and remains a snapshot after subsequent edits", () => {
  const lesson = initialLessons()[0],
    visible = learnerMaterial(lesson);
  assert.ok(!("notes" in visible));
  assert.ok(!JSON.stringify(visible).includes(lesson.notes));
  const original = visible.blocks[0].content;
  lesson.blocks[0].content = "Later revision";
  lesson.outcome = "A different outcome";
  assert.equal(visible.blocks[0].content, original);
  assert.notEqual(visible.outcome, lesson.outcome);
});
test("empty lessons and invalid activity durations cannot be approved", () => {
  const l = initialLessons()[0];
  assert.equal(lessonValid(l), true);
  assert.equal(lessonValid({ ...l, blocks: [] }), false);
  assert.equal(lessonValid({ ...l, title: " " }), false);
  assert.equal(lessonValid({ ...l, outcome: " " }), false);
  for (const minutes of [0, -1, NaN, Infinity])
    assert.equal(
      lessonValid({ ...l, blocks: [{ ...l.blocks[0], minutes }] }),
      false,
    );
  assert.equal(
    lessonValid({ ...l, blocks: [{ ...l.blocks[0], content: " " }] }),
    false,
  );
});
test("onboarding public teaching details transfer without legal identity information", () => {
  const p = initialProfile({
    ...initialAnswers,
    name: "Alex",
    role: "teacher",
    teachingLanguages: ["Japanese"],
    teachingLevels: ["A1"],
    duration: "45 minutes",
    rate: "42",
    legalName: "Private Name",
    dateOfBirth: "01/01/1990",
  });
  assert.equal(p.name, "Alex");
  assert.equal(p.languages, "Japanese");
  assert.equal(p.rate, "42");
  assert.ok(!("legalName" in p));
  assert.ok(!("dateOfBirth" in p));
});
test("deep screens retain the architecture parent tab", () => {
  for (const page of [
    "students",
    "student",
    "modules",
    "results",
    "messages",
    "submission",
  ])
    assert.equal(primaryTab({ page }), "students");
  for (const page of [
    "session",
    "availability",
    "recap",
    "reschedule",
    "lobby",
  ])
    assert.equal(primaryTab({ page }), "schedule");
  for (const page of ["editor", "lesson-preview", "share", "ai-review"])
    assert.equal(primaryTab({ page }), "lessons");
  for (const page of ["settings", "identity", "payout", "help"])
    assert.equal(primaryTab({ page }), "profile");
});

test("calendar ranges follow Monday weeks, leap years, month ends and year boundaries", async () => {
  const { calendarDates, moveCalendar } = await import(
    "../src/teacher/calendar.ts"
  );
  assert.deepEqual(calendarDates("2026-10-10", "Day"), ["2026-10-10"]);
  assert.deepEqual(calendarDates("2026-10-10", "Week"), [
    "2026-10-05",
    "2026-10-06",
    "2026-10-07",
    "2026-10-08",
    "2026-10-09",
    "2026-10-10",
    "2026-10-11",
  ]);
  assert.equal(calendarDates("2026-10-10", "Month").length, 35);
  assert.equal(calendarDates("2026-11-10", "Month").length, 42);
  assert.ok(calendarDates("2024-02-15", "Month").includes("2024-02-29"));
  assert.equal(moveCalendar("2026-01-31", "Month", 1), "2026-02-28");
  assert.equal(moveCalendar("2024-01-31", "Month", 1), "2024-02-29");
  assert.equal(moveCalendar("2026-12-15", "Month", 1), "2027-01-15");
  assert.equal(moveCalendar("2026-12-31", "Day", 1), "2027-01-01");
  assert.equal(moveCalendar("2026-10-24", "Week", 1), "2026-10-31");
});

test("overlapping calendar events remain individually accessible and adjacent sessions reuse space", async () => {
  const { sessionColumns } = await import("../src/teacher/calendar.ts");
  const source = initialSessions()[0];
  const entries = sessionColumns([
    { ...source, id: "a", time: "14:00" },
    { ...source, id: "b", time: "14:15" },
    { ...source, id: "c", time: "14:45" },
  ]);
  assert.equal(entries[0].columns, 2);
  assert.equal(entries[1].columns, 2);
  assert.notEqual(entries[0].column, entries[1].column);
  assert.equal(entries[2].columns, 1);
  assert.equal(source.time, "14:00");
});

test("review links open the editor, preview or library without changing the default entry", async () => {
  const { teacherEntryRoute } = await import("../src/teacher/entry-route.ts");
  const ids = ["cafe", "travel"];
  assert.deepEqual(
    teacherEntryRoute("?teacher=1&view=web&flow=editor&lesson=cafe", ids),
    { page: "editor", id: "cafe" },
  );
  assert.deepEqual(
    teacherEntryRoute("?teacher=1&view=mobile&flow=editor", ids),
    { page: "editor", id: "cafe" },
  );
  assert.deepEqual(
    teacherEntryRoute("?teacher=1&flow=preview&lesson=travel", ids),
    { page: "lesson-preview", id: "travel" },
  );
  assert.deepEqual(teacherEntryRoute("?teacher=1&flow=lessons", ids), {
    page: "lessons",
    tab: "Library",
  });
  assert.deepEqual(teacherEntryRoute("?teacher=1", ids), { page: "students" });
});

test("review entry ignores unsupported actions and sends unavailable browser-local lessons to the library", async () => {
  const { teacherEntryRoute } = await import("../src/teacher/entry-route.ts");
  assert.deepEqual(
    teacherEntryRoute("?flow=editor&lesson=someone-elses-local-draft", [
      "cafe",
    ]),
    { page: "lessons", tab: "Library" },
  );
  for (const flow of [
    "share",
    "delete",
    "apply",
    "https://example.com",
    "unknown",
  ])
    assert.deepEqual(
      teacherEntryRoute(`?flow=${encodeURIComponent(flow)}`, ["cafe"]),
      { page: "students" },
    );
});

test("module feedback sharing is scoped to completed blocks and keeps submitted work immutable", async () => {
  const { moduleResults, shareModuleFeedback } = await import(
    "../src/teacher/module-results.ts"
  );
  const result = moduleResults[0];
  const before = structuredClone(result);
  const book = {
    [result.id]: {
      "vocab-recall": { draft: "  Watch the article before a vowel.  " },
      "vocab-teach": { draft: "Legacy teaching-block draft" },
      "vocab-pairs": {
        draft: "Great matching!",
        shared: "Great matching!",
        sharedAt: "earlier",
      },
      "not-a-submitted-block": { draft: "Do not share this" },
    },
    "lucas-listening-1": {
      "listening-written": { draft: "Another student's private draft" },
    },
  };
  const shared = shareModuleFeedback(result, book, "now");
  assert.equal(
    shared[result.id]["vocab-recall"].shared,
    "Watch the article before a vowel.",
  );
  assert.equal(shared[result.id]["vocab-recall"].sharedAt, "now");
  assert.equal(shared[result.id]["vocab-teach"].shared, undefined);
  assert.equal(shared[result.id]["vocab-pairs"].sharedAt, "earlier");
  assert.equal(shared[result.id]["not-a-submitted-block"].shared, undefined);
  assert.equal(
    shared["lucas-listening-1"]["listening-written"].shared,
    undefined,
  );
  assert.equal(book[result.id]["vocab-recall"].shared, undefined);
  assert.deepEqual(result, before);
  const edited = {
    ...shared,
    [result.id]: {
      ...shared[result.id],
      "vocab-recall": {
        ...shared[result.id]["vocab-recall"],
        draft: "Try again",
      },
    },
  };
  assert.equal(
    edited[result.id]["vocab-recall"].shared,
    "Watch the article before a vowel.",
  );
});

test("feedback storage restores drafts and shared snapshots, rejects corrupt data without overwriting it", async () => {
  const { readFeedback, feedbackStorageKey } = await import(
    "../src/teacher/module-results.ts"
  );
  const book = {
    "lea-vocabulary-1": {
      "vocab-recall": {
        draft: "Keep trying",
        shared: "Well done",
        sharedAt: "now",
      },
    },
  };
  assert.deepEqual(
    readFeedback({
      getItem: (key) => {
        assert.equal(key, feedbackStorageKey);
        return JSON.stringify(book);
      },
    }),
    book,
  );
  assert.deepEqual(readFeedback({ getItem: () => null }), {});
  for (const raw of [
    "broken",
    "null",
    "[]",
    '{"r":null}',
    '{"r":{"b":{"draft":7}}}',
    '{"r":{"b":{"draft":"ok","shared":false}}}',
  ]) {
    assert.throws(() => readFeedback({ getItem: () => raw }));
  }
  assert.throws(() =>
    readFeedback({
      getItem: () => {
        throw new Error("Storage blocked");
      },
    }),
  );
});

test("results deep links select a known student and unknown students return to ongoing modules", async () => {
  const { teacherEntryRoute } = await import("../src/teacher/entry-route.ts");
  assert.deepEqual(teacherEntryRoute("?flow=results&student=lea", []), {
    page: "results",
    id: "lea",
  });
  assert.deepEqual(teacherEntryRoute("?flow=results&student=unknown", []), {
    page: "modules",
  });
  assert.deepEqual(teacherEntryRoute("?flow=modules", []), { page: "modules" });
});

test("structured feedback, assessment and annotations are shared without private teaching notes", async () => {
  const { shareModuleFeedback, moduleResults } = await import(
    "../src/teacher/module-results.ts"
  );
  const { isPending } = await import("../src/teacher/review.ts");
  const result = moduleResults.find((r) => r.id === "lea-speaking-1");
  const block = result.blocks[0];
  const value = {
    draft: "",
    review: {
      strength: "Clear message",
      nextStep: "Try ordering tea",
      privateNote: "Never send this note",
      criteria: [
        { id: "task", label: "Task completion", rating: "Meets task" },
      ],
      annotations: [
        {
          id: "a",
          kind: "audio",
          quote: "",
          correction: "",
          note: "Pause here",
          at: 2,
        },
      ],
    },
  };
  assert.equal(isPending(value), true);
  const shared = shareModuleFeedback(
    result,
    { [result.id]: { [block.id]: value } },
    "now",
  )[result.id][block.id];
  assert.ok(shared.shared.includes("Clear message"));
  assert.ok(shared.shared.includes("0:02"));
  assert.ok(shared.shared.includes("Task completion: Meets task"));
  assert.ok(!JSON.stringify(shared.sharedReview).includes("Never send"));
  assert.ok(!shared.shared.includes("Never send"));
  assert.equal(shared.review.privateNote, "Never send this note");
  assert.equal(isPending(shared), false);
  assert.equal(
    isPending({
      ...shared,
      review: { ...shared.review, privateNote: "Changed private note" },
    }),
    false,
  );
  assert.equal(
    isPending({
      ...shared,
      review: { ...shared.review, nextStep: "A changed next step" },
    }),
    true,
  );
  assert.equal(
    isPending({ draft: "", review: { privateNote: "Only a private note" } }),
    false,
  );
});

test("review queue status follows complete reviewed feedback and distinguishes sample revisions", async () => {
  const { moduleResults, shareModuleFeedback, canReviewBlock } = await import(
    "../src/teacher/module-results.ts"
  );
  const { reviewStatus, remainingReviews } = await import(
    "../src/teacher/review.ts"
  );
  const result = moduleResults[0];
  assert.equal(reviewStatus(result, {}), "Awaiting review");
  assert.equal(remainingReviews(result, {}), 2);
  const book = {
    [result.id]: Object.fromEntries(
      result.blocks
        .filter(canReviewBlock)
        .map((b) => [b.id, { draft: "Reviewed this response" }]),
    ),
  };
  const shared = shareModuleFeedback(result, book, "now");
  assert.equal(reviewStatus(result, shared), "Feedback shared");
  assert.equal(remainingReviews(result, shared), 0);
  const changed = structuredClone(shared);
  changed[result.id]["vocab-recall"].draft = "Changed feedback";
  assert.equal(reviewStatus(result, changed), "Awaiting review");
  assert.equal(remainingReviews(result, changed), 1);
  assert.equal(
    reviewStatus(
      moduleResults.find((r) => r.revision),
      {},
    ),
    "Revision submitted",
  );
});

test("audio and writing annotations validate evidence and recording bounds", async () => {
  const { validateAnnotation } = await import("../src/teacher/review.ts");
  const b = {
    id: "b",
    title: "Respond",
    type: "Practise · Written response",
    prompt: "Write",
    response: "Je veux un café.",
  };
  const a = {
    id: "a",
    kind: "writing",
    quote: "Je veux",
    correction: "Je voudrais",
    note: "A polite request",
  };
  assert.equal(validateAnnotation(a, b), "");
  assert.ok(validateAnnotation({ ...a, quote: "missing words" }, b));
  assert.ok(validateAnnotation({ ...a, correction: "", note: "" }, b));
  const recording = { ...b, recording: { seconds: 6, transcript: "Hi" } };
  for (const at of [-1, 7, NaN])
    assert.ok(validateAnnotation({ ...a, kind: "audio", at }, recording));
  assert.equal(
    validateAnnotation({ ...a, kind: "audio", at: 6 }, recording),
    "",
  );
});

test("follow-up practice creates an independent student draft and preserves the submission", async () => {
  const { moduleResults } = await import("../src/teacher/module-results.ts");
  const { followUpLesson } = await import("../src/teacher/review.ts");
  const { courseIssues } = await import("../src/teacher/course.ts");
  const source = moduleResults[0],
    before = structuredClone(source);
  const lesson = followUpLesson(
    source,
    source.blocks[1],
    students[0],
    "Use articles before vowels",
    "Write two new café requests.",
    "Written response",
    "new-followup",
  );
  assert.equal(lesson.studentId, "lea");
  assert.equal(lesson.status, "Draft");
  assert.equal(lesson.course.modules[0].type, "Vocabulary");
  assert.equal(lesson.course.modules[0].blocks[0].purpose, "Practise");
  assert.equal(
    lesson.course.modules[0].blocks[0].text,
    "Write two new café requests.",
  );
  assert.equal(lesson.notes, "");
  assert.deepEqual(courseIssues(lesson.course), []);
  lesson.course.modules[0].blocks[0].text = "A later edit";
  assert.deepEqual(source, before);
});

test("feedback reader rejects malformed optional review records", async () => {
  const { readFeedback } = await import("../src/teacher/module-results.ts");
  for (const review of [
    [],
    { strength: 7 },
    { criteria: [{ id: "x", label: "Task", rating: "made up" }] },
    {
      annotations: [
        { id: "a", kind: "writing", quote: 1, correction: "ok", note: "" },
      ],
    },
  ]) {
    assert.throws(() =>
      readFeedback({
        getItem: () => JSON.stringify({ r: { b: { draft: "", review } } }),
      }),
    );
  }
});

test("reusing submitted activities retains their assessed format and original keys in independent blocks", async () => {
  const { moduleResults, canReviewBlock } = await import(
    "../src/teacher/module-results.ts"
  );
  const { reusePractice } = await import("../src/teacher/review.ts");
  const { blockIssues, answerKey } = await import("../src/teacher/course.ts");
  for (const block of moduleResults
    .flatMap((r) => r.blocks)
    .filter(canReviewBlock)) {
    const before = structuredClone(block),
      copy = reusePractice(block);
    assert.deepEqual(blockIssues(copy), [], block.id);
    assert.notEqual(copy.id, block.id);
    if (copy.format === "Vocabulary recall")
      assert.equal(answerKey(copy), block.answer);
    else if (copy.format === "Quiz") assert.equal(copy.answer, "3:15");
    else if (copy.format === "Matching pairs")
      assert.equal(copy.pairs.length, 3);
    else if (copy.answer) assert.equal(copy.answer, block.answer);
    copy.text = "Later edits";
    assert.deepEqual(block, before);
  }
});

test("lesson settings distinguish unset, paid and explicitly confirmed free pricing", async () => {
  const { validLessonSettings, lessonSettingsReady, lessonPriceLabel } =
    await import("../src/lesson-settings.ts");
  const empty = { duration: "", rate: "", freeConfirmed: false };
  assert.equal(validLessonSettings(empty), true);
  assert.equal(lessonSettingsReady(empty), false);
  assert.equal(validLessonSettings({ ...empty, duration: "45 minutes" }), true);
  assert.equal(validLessonSettings({ ...empty, rate: "30" }), true);
  const free = { duration: "45 minutes", rate: "0", freeConfirmed: false };
  assert.equal(validLessonSettings(free), false);
  assert.equal(lessonSettingsReady({ ...free, freeConfirmed: true }), true);
  assert.equal(lessonPriceLabel(""), "Not set");
  assert.equal(lessonPriceLabel("0", true), "Free (€0)");
  for (const rate of ["-1", "NaN", "Infinity", "1001"])
    assert.equal(
      validLessonSettings({ ...empty, rate, freeConfirmed: true }),
      false,
    );
  assert.equal(lessonSettingsReady({ ...free, rate: "30.5" }), true);
  assert.equal(
    lessonSettingsReady({ ...free, rate: "0.00", freeConfirmed: false }),
    false,
  );
});

test("onboarding deferral keeps real profile settings unset rather than copying seed prices", () => {
  const p = initialProfile({
    ...initialAnswers,
    role: "teacher",
    name: "Alex",
    duration: "",
    rate: "",
  });
  assert.equal(p.duration, "");
  assert.equal(p.rate, "");
  assert.equal(p.freeConfirmed, false);
  const free = initialProfile({
    ...initialAnswers,
    role: "teacher",
    duration: "30 minutes",
    rate: "0",
    freeConfirmed: true,
  });
  assert.equal(free.rate, "0");
  assert.equal(free.freeConfirmed, true);
  assert.equal(initialProfile().rate, "30");
});


test("student publication requires saved terms but draft templates do not", async () => {
  const { lessonPublicationIssues } = await import("../src/lesson-settings.ts");
  const empty = { duration: "", rate: "", freeConfirmed: false };
  assert.equal(lessonPublicationIssues(empty, true).length, 2);
  assert.deepEqual(lessonPublicationIssues(empty, false), []);
  const free = { duration: "45 minutes", rate: "0", freeConfirmed: false };
  assert.match(lessonPublicationIssues(free, true)[0], /Confirm/);
  assert.deepEqual(lessonPublicationIssues({ ...free, freeConfirmed: true }, true), []);
  assert.deepEqual(lessonPublicationIssues({ ...free, rate: "30" }, true), []);
  assert.equal(lessonPublicationIssues({ ...free, rate: "-1" }, true).length, 1);
});


test("block navigation skips viewed teaching content, drafts and shared feedback", async () => {
  const { blockReviewLabel, nextUnreviewedBlock } = await import("../src/teacher/review.ts");
  const { moduleResults } = await import("../src/teacher/module-results.ts");
  const result = moduleResults.find((r) => r.id === "lea-vocabulary-1");
  const [teach, recall, pairs] = result.blocks;
  assert.equal(blockReviewLabel(teach), "Viewed");
  assert.equal(blockReviewLabel(recall), "Unreviewed");
  assert.equal(blockReviewLabel(recall, { draft: "", review: { privateNote: "Private only" } }), "Unreviewed");
  assert.equal(nextUnreviewedBlock(result, {}, teach.id), recall.id);
  assert.equal(nextUnreviewedBlock(result, {}, recall.id), pairs.id);
  assert.equal(nextUnreviewedBlock(result, {}, pairs.id), recall.id);
  const rows = { [recall.id]: { draft: "Try the article again." } };
  assert.equal(blockReviewLabel(recall, rows[recall.id]), "Feedback draft");
  assert.equal(nextUnreviewedBlock(result, rows, pairs.id), undefined);
  rows[pairs.id] = { draft: "Well done", shared: "Well done" };
  assert.equal(blockReviewLabel(pairs, rows[pairs.id]), "Feedback shared");
  assert.equal(nextUnreviewedBlock(result, rows, teach.id), undefined);
  assert.equal(blockReviewLabel(pairs, { draft: "Revised feedback", shared: "Earlier feedback" }), "Edited draft");
  assert.equal(nextUnreviewedBlock({ ...result, blocks: [] }, {}, ""), undefined);
});
