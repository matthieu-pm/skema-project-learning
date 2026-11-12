import { availableSlots, fixtureBookings, teachers, type Booking, type LessonFormat, type Slot } from "./model.ts";
import { preparationIdForTeacher } from "./preparation.ts";

export const bookingStorageKey = "mimo.learner-bookings.v1";
const lockName = "mimo.learner-bookings.v1";
type StorageLike = Pick<Storage, "getItem" | "setItem">;
type LocksLike = { request: <T>(name: string, callback: () => T | Promise<T>) => Promise<T> };
export type StorageOptions = { now?: Date; seed?: Booking[]; storage?: StorageLike; locks?: LocksLike | null };
const changed = "mimo-learner-bookings-changed";
function storageFor(options: StorageOptions): StorageLike {
  try { return options.storage ?? window.localStorage; }
  catch { throw new Error("Your browser couldn’t open saved bookings. Try again before booking."); }
}
function validBooking(value: unknown): value is Booking {
  if (!value || typeof value !== "object") return false;
  const b = value as Booking;
  return typeof b.id === "string" && typeof b.slotId === "string" && teachers.some((t) => t.id === b.teacherId)
    && Number.isFinite(Date.parse(b.start)) && Number.isFinite(Date.parse(b.end)) && Date.parse(b.start) < Date.parse(b.end)
    && ["Online", "In person"].includes(b.format) && ["confirmed", "cancelled"].includes(b.status) && b.paymentStatus === "paid"
    && Number.isFinite(b.rate) && b.rate >= 0 && Number.isFinite(b.duration) && b.duration > 0
    && (b.preparationId === undefined || typeof b.preparationId === "string")
    && (b.language === undefined || teachers.some((t) => t.id === b.teacherId && t.languages.includes(b.language!)))
    && (b.completedAt === undefined || Number.isFinite(Date.parse(b.completedAt)))
    && (!b.review || (Number.isInteger(b.review.rating) && b.review.rating >= 1 && b.review.rating <= 5 && typeof b.review.text === "string" && Number.isFinite(Date.parse(b.review.date))));
}
function read(options: StorageOptions): Booking[] {
  try {
    const raw = storageFor(options).getItem(bookingStorageKey);
    if (raw === null) return structuredClone(options.seed ?? fixtureBookings(options.now ?? new Date()));
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1 || !Array.isArray(parsed.bookings) || !parsed.bookings.every(validBooking) || new Set(parsed.bookings.map((b: Booking) => b.id)).size !== parsed.bookings.length) throw new Error("invalid");
    return parsed.bookings;
  } catch { throw new Error("Saved bookings couldn’t be read. Reload and try again; no payment was taken."); }
}
export function readBookings(seed?: Booking[], options: StorageOptions = {}): Booking[] { return read({ ...options, ...(seed ? { seed } : {}) }); }
function write(bookings: Booking[], options: StorageOptions) {
  try { storageFor(options).setItem(bookingStorageKey, JSON.stringify({ version: 1, bookings })); }
  catch { throw new Error("Your booking couldn’t be saved. Try again; no payment was taken."); }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(changed));
}
export function subscribeBookings(callback: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === bookingStorageKey || event.key === null) callback(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(changed, callback);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(changed, callback); };
}
async function exclusive<T>(options: StorageOptions, callback: () => T | Promise<T>): Promise<T> {
  const locks = options.locks !== undefined ? options.locks : (typeof navigator === "undefined" ? undefined : navigator.locks);
  // Without a shared origin lock, a second tab could overwrite a reservation.
  if (!locks) throw new Error("We couldn’t reserve this time. Try again; you haven’t been charged.");
  return locks.request(lockName, callback);
}
export type BookingInput = { teacherId: string; slotId: string; format: LessonFormat; language?: string; replaceBookingId?: string; requestId?: string };
export async function instantBook(input: BookingInput, slots: Slot[], options: StorageOptions = {}): Promise<Booking> {
  return exclusive(options, () => {
    const now = options.now ?? new Date();
    const bookings = read(options);
    const teacher = teachers.find((value) => value.id === input.teacherId);
    const slot = slots.find((value) => value.id === input.slotId && value.teacherId === input.teacherId && value.format === input.format);
    const previous = input.replaceBookingId ? bookings.find((b) => b.id === input.replaceBookingId && b.status === "confirmed") : undefined;
    if (input.replaceBookingId && (!previous || Date.parse(previous.start) <= now.getTime())) throw new Error("This lesson can no longer be rescheduled. Your original booking is unchanged.");
    // A retry of the same successful booking returns its receipt, rather than creating another payment or record.
    const already = input.requestId && bookings.find((b) => b.requestId === input.requestId && b.slotId === input.slotId && b.teacherId === input.teacherId && b.format === input.format && b.status === "confirmed");
    if (already && !input.replaceBookingId) return already;
    if (!teacher || !slot || !teacher.formats.includes(input.format) || !availableSlots(input.teacherId, slots, bookings.filter((b) => b.id !== previous?.id), now).some((value) => value.id === slot.id)) throw new Error("That time is no longer available. Choose another slot; no payment was taken.");
    if (previous && previous.teacherId !== teacher.id) throw new Error("Choose a new time with the same teacher. Your original booking is unchanged.");
    // Rescheduling keeps the booked language; a new booking never silently picks one for a multilingual teacher.
    const language = previous ? (previous.language ?? input.language) : input.language ?? (teacher.languages.length === 1 ? teacher.languages[0] : undefined);
    if (!language || !teacher.languages.includes(language)) throw new Error("Choose a lesson language this teacher offers. No payment was taken.");
    if (previous?.language && input.language && input.language !== previous.language) throw new Error("A reschedule keeps the original lesson language. Your original booking is unchanged.");
    const booking: Booking = { id: previous?.id ?? `booking-${globalThis.crypto.randomUUID()}`, teacherId: teacher.id, slotId: slot.id, start: slot.start, end: slot.end, format: slot.format, status: "confirmed", paymentStatus: "paid", rate: previous?.rate ?? teacher.rate, duration: previous?.duration ?? teacher.duration, preparationId: previous?.preparationId ?? preparationIdForTeacher(teacher.id, language), language, ...(input.requestId ? { requestId: input.requestId } : {}) };
    write([...bookings.filter((value) => value.id !== booking.id), booking], options);
    return booking;
  });
}
export async function cancelBooking(id: string, options: StorageOptions = {}): Promise<Booking[]> {
  return exclusive(options, () => {
    const bookings = read(options), now = options.now ?? new Date();
    const target = bookings.find((booking) => booking.id === id);
    if (!target || target.status !== "confirmed" || Date.parse(target.start) <= now.getTime()) throw new Error("This lesson can no longer be cancelled.");
    const updated = bookings.map((booking) => booking.id === id ? { ...booking, status: "cancelled" as const } : booking);
    write(updated, options);
    return updated;
  });
}
export async function saveReview(id: string, review: { rating: number; text: string }, options: StorageOptions = {}): Promise<Booking[]> {
  return exclusive(options, () => {
    const bookings = read(options), now = options.now ?? new Date();
    const target = bookings.find((booking) => booking.id === id);
    if (!target || target.status !== "confirmed" || (Date.parse(target.end) > now.getTime() && !target.completedAt) || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5 || !review.text.trim()) throw new Error("Choose a rating and describe your completed lesson before saving.");
    const updated = bookings.map((booking) => booking.id === id ? { ...booking, review: { ...review, text: review.text.trim(), date: now.toISOString() } } : booking);
    write(updated, options);
    return updated;
  });
}

/** Explicitly finishes a started simulated session. Leaving the room never calls this. */
export async function completeSession(id: string, options: StorageOptions = {}): Promise<Booking[]> {
  return exclusive(options, () => {
    const bookings = read(options), now = options.now ?? new Date();
    const target = bookings.find((booking) => booking.id === id);
    if (!target || target.status !== "confirmed" || Date.parse(target.start) > now.getTime()) throw new Error("Only a lesson that has started can be completed.");
    if (target.completedAt) return bookings;
    const updated = bookings.map((booking) => booking.id === id ? { ...booking, completedAt: now.toISOString() } : booking);
    write(updated, options);
    return updated;
  });
}
