import test from "node:test";
import assert from "node:assert/strict";
import {
  teachers, createSlots, fixtureBookings, availableSlots, filterTeachers,
  classifyLesson, ratingSummary, parisDay, parisTime, addDays,
} from "../src/learner/model.ts";
import {
  bookingStorageKey, readBookings, instantBook, cancelBooking, saveReview,
} from "../src/learner/storage.ts";
import { publicLessonsForTeacher } from "../src/learner/public-lessons.ts";

const now = new Date("2026-11-11T08:00:00Z");
function harness(seed = []) {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  let queue = Promise.resolve();
  const locks = { request(_name, callback) { const result = queue.then(callback); queue = result.catch(() => {}); return result; } };
  return { values, options: { now, seed, storage, locks } };
}
const slots = createSlots(now);
const online = availableSlots("gilbert", slots, [], now, { formats: ["Online"] })[0];
const input = (slot = online, extra = {}) => ({ teacherId: slot.teacherId, slotId: slot.id, format: slot.format, ...extra });

test("catalog ratings equal the complete visible review list and new teachers have a neutral state", () => {
  assert.equal(teachers.length, 25);
  const gilbert = teachers[0];
  assert.equal(gilbert.name, "Gilbert");
  assert.equal(gilbert.duration, 30);
  assert.equal(gilbert.rate, 30);
  assert.deepEqual(gilbert.formats, ["Online", "In person"]);
  assert.equal(ratingSummary(gilbert).count, gilbert.reviews.length);
  assert.equal(ratingSummary(gilbert).average, 14 / 3);
  assert.deepEqual(ratingSummary(teachers.find((t) => !t.reviews.length)), { average: null, count: 0 });
});

test("public lesson outlines belong only to their teacher and their published totals match the curriculum", () => {
  const lessons = publicLessonsForTeacher("gilbert");
  assert.equal(lessons.length, 1);
  const lesson = lessons[0];
  assert.equal(lesson.teacherId, "gilbert");
  assert.equal(lesson.modules.length, 6);
  assert.equal(new Set(lesson.modules.map(module => module.id)).size, lesson.modules.length);
  assert.equal(lesson.modules.reduce((total, module) => total + module.minutes, 0), lesson.minutes);
  assert.equal(lesson.minutes, 30);
  assert.equal(lesson.modules.reduce((total, module) => total + module.blockCount, 0), 9);
  for (const teacher of teachers.filter(teacher => teacher.id !== "gilbert")) {
    assert.deepEqual(publicLessonsForTeacher(teacher.id), []);
  }
  assert.deepEqual(publicLessonsForTeacher("unknown-teacher"), []);
});

test("new bookings bind the teacher's preparation and keep it through a reschedule", async () => {
  const h = harness();
  const booked = await instantBook(input(), slots, h.options);
  assert.equal(booked.preparationId, "gilbert-cafe-v1");
  const next = availableSlots("gilbert", slots, [booked], now, { formats: ["Online"] })[0];
  const changed = await instantBook(input(next, { replaceBookingId: booked.id }), slots, h.options);
  assert.equal(changed.id, booked.id);
  assert.equal(changed.preparationId, booked.preparationId);
  assert.equal(changed.rate, booked.rate);
  assert.equal(changed.duration, booked.duration);
});

test("preparation from another teacher is rejected without writing a booking", async () => {
  const h = harness();
  const diego = availableSlots("diego", slots, [], now, { formats: ["Online"] })[0];
  await assert.rejects(instantBook(input(diego, { preparationId: "gilbert-cafe-v1" }), slots, h.options), /does not belong/);
  assert.equal(h.values.has(bookingStorageKey), false);
  const booked = await instantBook(input(diego), slots, h.options);
  assert.equal(booked.preparationId, undefined);
});

test("Today and Tomorrow use Europe/Paris dates, including DST changes and UTC day boundaries", () => {
  const late = new Date("2026-11-11T23:15:00Z");
  assert.equal(parisDay(late), "2026-11-12");
  const generated = createSlots(late);
  for (const teacher of teachers) {
    const today = availableSlots(teacher.id, generated, [], late, { day: "Today" });
    assert.ok(today.every((s) => parisDay(new Date(s.start)) === "2026-11-12"));
    const tomorrow = availableSlots(teacher.id, generated, [], late, { day: "Tomorrow" });
    assert.ok(tomorrow.length);
    assert.ok(tomorrow.every((s) => parisDay(new Date(s.start)) === "2026-11-13"));
  }
  assert.equal(parisTime("2026-10-25", 10).toISOString(), "2026-10-25T09:00:00.000Z");
  assert.equal(parisTime("2026-03-29", 10).toISOString(), "2026-03-29T08:00:00.000Z");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});

test("combined formats match either preference while every sort preserves language and day filters", () => {
  const filters = { language: "French", formats: ["Online", "In person"], day: "Tomorrow" };
  const source = filterTeachers(teachers, slots, [], now, filters);
  assert.ok(source.some((t) => t.formats.length === 1));
  const price = filterTeachers(teachers, slots, [], now, filters, "Price (lowest to highest)");
  const rated = filterTeachers(teachers, slots, [], now, filters, "Rating (highest first)");
  const soonest = filterTeachers(teachers, slots, [], now, filters, "Soonest available");
  assert.deepEqual(new Set(price.map((t) => t.id)), new Set(source.map((t) => t.id)));
  assert.deepEqual(new Set(rated.map((t) => t.id)), new Set(source.map((t) => t.id)));
  for (let i = 1; i < price.length; i++) assert.ok(price[i - 1].rate <= price[i].rate);
  for (let i = 1; i < rated.length; i++) assert.ok((ratingSummary(rated[i - 1]).average ?? -1) >= (ratingSummary(rated[i]).average ?? -1));
  for (let i = 1; i < soonest.length; i++) assert.ok(Date.parse(availableSlots(soonest[i - 1].id, slots, [], now, filters)[0].start) <= Date.parse(availableSlots(soonest[i].id, slots, [], now, filters)[0].start));
  assert.equal(filterTeachers(teachers, slots, [], now, { day: "Today" }).some((t) => t.id === "yuki"), false);
  const travel = filterTeachers(teachers, slots, [], now, { query: "travel" });
  assert.ok(travel.length > 0);
  assert.ok(travel.every(teacher => teacher.bio.toLowerCase().includes("travel")));
});

test("lesson categories partition time with start inclusive and end exclusive; cancelled lessons are excluded", () => {
  const [ongoing, upcoming, past] = fixtureBookings(now);
  assert.equal(classifyLesson(ongoing, now), "Ongoing");
  assert.equal(classifyLesson(upcoming, now), "Upcoming");
  assert.equal(classifyLesson(past, now), "Past");
  assert.equal(classifyLesson(ongoing, new Date(ongoing.start)), "Ongoing");
  assert.equal(classifyLesson(ongoing, new Date(ongoing.end)), "Past");
  assert.equal(classifyLesson({ ...ongoing, status: "cancelled" }, now), null);
});

test("instant booking saves one confirmed receipt and removes overlapping slots in both formats", async () => {
  const h = harness();
  const booking = await instantBook(input(), slots, h.options);
  assert.equal(booking.status, "confirmed");
  assert.equal(booking.paymentStatus, "paid");
  assert.equal(booking.rate, 30);
  const saved = readBookings([], h.options);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].id, booking.id);
  assert.ok(!availableSlots("gilbert", slots, saved, now).some((s) => s.start === online.start));
  await assert.rejects(instantBook(input(), slots, h.options), /no longer available.*no payment/i);
  assert.equal(readBookings([], h.options).length, 1);
});

test("two simultaneous requests recheck persisted availability inside an exclusive lock", async () => {
  const h = harness();
  const results = await Promise.allSettled([instantBook(input(), slots, h.options), instantBook(input(), slots, h.options)]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(results.filter((r) => r.status === "rejected").length, 1);
  assert.equal(readBookings([], h.options).length, 1);
});

test("retrying the same payment request returns its saved receipt without duplicating it", async () => {
  const h = harness();
  const first = await instantBook(input(online, { requestId: "checkout-1" }), slots, h.options);
  const second = await instantBook(input(online, { requestId: "checkout-1" }), slots, h.options);
  assert.equal(second.id, first.id);
  assert.equal(readBookings([], h.options).length, 1);
});

test("unavailable or malformed storage and failed writes never report a successful payment", async () => {
  const h = harness();
  await assert.rejects(instantBook(input(), slots, { ...h.options, storage: { getItem() { throw new Error("denied"); }, setItem() {} } }), /could not be read.*no payment/i);
  await assert.rejects(instantBook(input(), slots, { ...h.options, storage: { getItem: () => null, setItem() { throw new Error("quota"); } } }), /could not be saved.*no payment/i);
  h.values.set(bookingStorageKey, "invalid JSON");
  await assert.rejects(instantBook(input(), slots, h.options), /could not be read/i);
  assert.equal(h.values.get(bookingStorageKey), "invalid JSON");
  await assert.rejects(instantBook(input(), slots, { ...h.options, locks: null }), /cannot reserve a time slot.*Try another browser/i);
});

test("cancelling a future booking releases its time and preserves the cancelled record", async () => {
  const h = harness();
  const booking = await instantBook(input(), slots, h.options);
  const cancelled = await cancelBooking(booking.id, h.options);
  assert.equal(cancelled[0].status, "cancelled");
  assert.ok(availableSlots("gilbert", slots, cancelled, now).some((s) => s.id === online.id));
  assert.equal(classifyLesson(cancelled[0], now), null);
});

test("rescheduling is atomic and keeps the original receipt when a replacement is unavailable or saving fails", async () => {
  const h = harness();
  const booking = await instantBook(input(), slots, h.options);
  const replacement = availableSlots("gilbert", slots, [booking], now)[0];
  await assert.rejects(instantBook({ ...input(replacement), replaceBookingId: booking.id }, slots, { ...h.options, storage: { getItem: h.options.storage.getItem, setItem() { throw new Error("quota"); } } }), /could not be saved/i);
  assert.equal(readBookings([], h.options)[0].start, booking.start);
  const changed = await instantBook({ ...input(replacement), replaceBookingId: booking.id }, slots, h.options);
  assert.equal(changed.id, booking.id);
  assert.equal(changed.start, replacement.start);
  assert.equal(readBookings([], h.options).length, 1);
  assert.ok(availableSlots("gilbert", slots, readBookings([], h.options), now).some((s) => s.id === online.id));
});

test("reviews save only after a completed lesson and retain a browser-local snapshot", async () => {
  const seed = fixtureBookings(now), h = harness(seed);
  await assert.rejects(saveReview(seed[1].id, { rating: 5, text: "Too early" }, h.options), /completed lesson/i);
  const saved = await saveReview(seed[2].id, { rating: 5, text: " Useful feedback. " }, h.options);
  assert.equal(saved.find((b) => b.id === seed[2].id).review.text, "Useful feedback.");
  assert.equal(readBookings(seed, h.options).find((b) => b.id === seed[2].id).review.rating, 5);
  assert.equal(seed[2].review, undefined);
});
