import test from "node:test";
import assert from "node:assert/strict";
import { initialAvailability, availabilityErrors, dayHoursError, nextTimeRange, copyDayHours } from "../src/teacher/availability.ts";
import { teacherEntryRoute } from "../src/teacher/entry-route.ts";

test("initial hours keep the previous teaching days and timezone with independent day ranges", () => {
  const value = initialAvailability();
  assert.deepEqual(Object.keys(value.week).filter(day => value.week[day].enabled), ["Mon", "Tue", "Thu", "Fri"]);
  assert.deepEqual(availabilityErrors(value), {});
  value.week.Mon.ranges[0].start = "10:00";
  assert.equal(value.week.Tue.ranges[0].start, "09:00");
});
test("only enabled days are validated, with non-overlapping ranges and complete same-day times", () => {
  const value = initialAvailability();
  value.week.Mon.ranges = [{ id: "a", start: "09:00", end: "12:00" }, { id: "b", start: "12:00", end: "17:00" }];
  assert.equal(dayHoursError(value.week.Mon), undefined);
  value.week.Mon.ranges[1].start = "11:59";
  assert.match(dayHoursError(value.week.Mon), /overlap/);
  value.week.Mon.ranges[1].start = "17:01";
  assert.match(dayHoursError(value.week.Mon), /after start/);
  value.week.Mon.ranges[1].start = "13:00";
  value.week.Mon.ranges[0].start = "24:01";
  assert.match(dayHoursError(value.week.Mon), /Enter/);
  value.week.Mon.enabled = false;
  assert.equal(dayHoursError(value.week.Mon), undefined);
});
test("copy applies only to selected days and creates independent range IDs and content", () => {
  const value = initialAvailability(), before = structuredClone(value);
  value.week.Mon.ranges[0].start = "10:00";
  let sequence = 0;
  const copy = copyDayHours(value, "Mon", ["Wed", "Sat"], () => `copy-${sequence++}`);
  assert.equal(copy.week.Wed.enabled, true);
  assert.equal(copy.week.Sat.enabled, true);
  assert.equal(copy.week.Wed.ranges[0].start, "10:00");
  assert.equal(copy.week.Tue.ranges[0].start, before.week.Tue.ranges[0].start);
  assert.notEqual(copy.week.Wed.ranges[0].id, copy.week.Sat.ranges[0].id);
  copy.week.Wed.ranges[0].start = "11:00";
  assert.equal(value.week.Mon.ranges[0].start, "10:00");
  assert.equal(copy.week.Sat.ranges[0].start, "10:00");
  assert.equal(value.week.Wed.enabled, false);
});
test("appending hours stays inside the day and validation preserves empty-week and timezone gates", () => {
  assert.deepEqual(nextTimeRange([{ id: "a", start: "09:00", end: "17:00" }], "b"), { id: "b", start: "17:00", end: "18:00" });
  assert.equal(nextTimeRange([{ id: "a", start: "23:00", end: "23:59" }], "b"), undefined);
  const value = initialAvailability();
  Object.values(value.week).forEach(day => { day.enabled = false; });
  assert.match(availabilityErrors(value).week, /at least one/);
  value.zone = "Asia/Tokyo";
  assert.match(availabilityErrors(value).zone, /Europe\/Paris/);
  assert.deepEqual(teacherEntryRoute("?flow=availability", ["cafe"]), { page: "availability" });
});
