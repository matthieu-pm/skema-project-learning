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
  const { calendarDates, moveCalendar } = await import("../src/teacher/calendar.ts");
  assert.deepEqual(calendarDates("2026-10-10", "Day"), ["2026-10-10"]);
  assert.deepEqual(calendarDates("2026-10-10", "Week"), ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11"]);
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
  const entries = sessionColumns([{ ...source, id: "a", time: "14:00" }, { ...source, id: "b", time: "14:15" }, { ...source, id: "c", time: "14:45" }]);
  assert.equal(entries[0].columns, 2);
  assert.equal(entries[1].columns, 2);
  assert.notEqual(entries[0].column, entries[1].column);
  assert.equal(entries[2].columns, 1);
  assert.equal(source.time, "14:00");
});
