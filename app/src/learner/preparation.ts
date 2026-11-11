import type { Course, CourseBlock } from "../teacher/course.ts";
import type { Booking } from "./model.ts";
import { preparationCourse } from "./preparation-course.ts";

export type Preparation = { id: string; teacherId: string; version: number; course: Course };
export type PreparationProgress = {
  bookingId: string;
  preparationId: string;
  version: number;
  blocks: Record<string, { answers: Record<string, string>; completedAt?: string }>;
};
type PreparationBooking = Pick<Booking, "id" | "teacherId" | "status"> & { preparationId?: string };
type StorageLike = Pick<Storage, "getItem" | "setItem">;
type LocksLike = { request: <T>(name: string, callback: () => T | Promise<T>) => Promise<T> };
export type PreparationOptions = { storage?: StorageLike; now?: Date; locks?: LocksLike | null };
type Library = { version: 1; progress: PreparationProgress[] };

export const preparationStorageKey = "mimo.learner-preparation.v1";
export const preparationAnswerLimit = 10_000;
const changed = "mimo-learner-preparation-changed";

// A versioned public snapshot: editor-template or private-draft changes cannot alter it.
const cafeLessonId = "gilbert-cafe";
const cafe: Preparation = {
  id: "gilbert-cafe-v1",
  teacherId: "gilbert",
  version: 1,
  course: preparationCourse,
};
const blocks = new Map(cafe.course.modules.flatMap(module => module.blocks.map(block => [block.id, block] as const)));

export function preparationForLesson(teacherId: string, lessonId?: string): Preparation | undefined {
  return teacherId === cafe.teacherId && (lessonId === undefined || lessonId === cafeLessonId)
    ? structuredClone(cafe)
    : undefined;
}

export function preparationForBooking(booking: PreparationBooking): Preparation | undefined {
  if (!booking.id?.trim() || booking.id.length > 200 || booking.status !== "confirmed" || booking.teacherId !== cafe.teacherId
    || (booking.preparationId !== undefined && booking.preparationId !== cafe.id)) return undefined;
  // Older confirmed Gilbert receipts predate the explicit assignment field.
  return structuredClone(cafe);
}

function requiredAnswerKeys(block: CourseBlock): string[] {
  if (block.purpose === "Practice" && ["Vocabulary recall", "Flashcards"].includes(block.format)) return block.words.map(word => word.id);
  if (block.purpose === "Practice" && ["Matching pairs", "Word sorting"].includes(block.format)) return block.pairs.map(pair => pair.id);
  return ["response"];
}

/** Completeness only: an attempted answer need not be correct to count as submitted. */
export function preparationBlockComplete(block: CourseBlock, answers: Record<string, string>): boolean {
  if (block.purpose === "Teach") return true;
  const keys = requiredAnswerKeys(block);
  return keys.length > 0 && keys.every(key => typeof answers[key] === "string" && !!answers[key].trim());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}

function validAnswers(block: CourseBlock, value: unknown): value is Record<string, string> {
  const keys = new Set(requiredAnswerKeys(block));
  return isRecord(value) && Object.entries(value).every(([key, answer]) => keys.has(key)
    && typeof answer === "string" && answer.length <= preparationAnswerLimit);
}

function validProgress(value: unknown): value is PreparationProgress {
  if (!isRecord(value) || typeof value.bookingId !== "string" || !value.bookingId.trim() || value.bookingId.length > 200
    || value.preparationId !== cafe.id || value.version !== cafe.version || !isRecord(value.blocks)) return false;
  return Object.entries(value.blocks).every(([blockId, record]) => {
    const block = blocks.get(blockId);
    return !!block && isRecord(record) && validAnswers(block, record.answers)
      && (record.completedAt === undefined || (typeof record.completedAt === "string" && record.completedAt.length <= 64
        && Number.isFinite(Date.parse(record.completedAt)) && preparationBlockComplete(block, record.answers)));
  });
}

function storageFor(options: PreparationOptions): StorageLike {
  try { return options.storage ?? window.localStorage; }
  catch { throw new Error("Your browser could not open saved preparation. Reload and try again before continuing."); }
}

function readLibrary(storage: StorageLike): Library {
  try {
    const raw = storage.getItem(preparationStorageKey);
    if (raw === null) return { version: 1, progress: [] };
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.progress) || !value.progress.every(validProgress)) throw new Error("Invalid preparation");
    const keys = value.progress.map(progress => `${progress.bookingId}\u0000${progress.preparationId}\u0000${progress.version}`);
    if (new Set(keys).size !== keys.length) throw new Error("Duplicate preparation");
    return { version: 1, progress: value.progress };
  } catch {
    throw new Error("Saved preparation could not be read. Reload and try again; your saved work has not been changed.");
  }
}

function requirePreparation(booking: PreparationBooking): Preparation {
  const preparation = preparationForBooking(booking);
  if (!preparation) throw new Error("Preparation is not available for this booking. Return to your lessons and choose a confirmed session.");
  return preparation;
}

function progressFor(library: Library, booking: PreparationBooking, preparation: Preparation): PreparationProgress {
  return library.progress.find(progress => progress.bookingId === booking.id && progress.preparationId === preparation.id && progress.version === preparation.version)
    ?? { bookingId: booking.id, preparationId: preparation.id, version: preparation.version, blocks: {} };
}

export function readPreparation(booking: PreparationBooking, options: PreparationOptions = {}): PreparationProgress {
  const preparation = requirePreparation(booking);
  return structuredClone(progressFor(readLibrary(storageFor(options)), booking, preparation));
}

async function exclusive<T>(options: PreparationOptions, work: () => T): Promise<T> {
  const locks = options.locks !== undefined ? options.locks : typeof navigator === "undefined" ? undefined : navigator.locks;
  // Progress can save without Web Locks: the fallback read/write is synchronous in one
  // event loop. Cross-tab exclusion is available with locks; no cross-device sync exists.
  return locks ? locks.request(preparationStorageKey, work) : work();
}

export async function savePreparationBlock(booking: PreparationBooking, blockId: string, answers: Record<string, string>, complete: boolean, options: PreparationOptions = {}): Promise<PreparationProgress> {
  requirePreparation(booking);
  const block = blocks.get(blockId);
  if (!block || !validAnswers(block, answers) || typeof complete !== "boolean") throw new Error("This answer could not be saved. Use this activity’s fields and keep each answer to 10,000 characters or fewer.");
  if (complete && !preparationBlockComplete(block, answers)) throw new Error("Complete every answer in this activity before marking it complete.");
  const nextAnswers = { ...answers };
  return exclusive(options, () => {
    const preparation = requirePreparation(booking);
    const storage = storageFor(options);
    const library = readLibrary(storage);
    const progress = progressFor(library, booking, preparation);
    const previous = progress.blocks[blockId];
    const unchanged = !!previous && Object.keys(previous.answers).length === Object.keys(nextAnswers).length
      && Object.entries(nextAnswers).every(([key, answer]) => previous.answers[key] === answer);
    const completedAt = complete ? unchanged && previous?.completedAt || (options.now ?? new Date()).toISOString()
      : unchanged ? previous.completedAt : undefined;
    const next: PreparationProgress = {
      ...progress,
      blocks: { ...progress.blocks, [blockId]: { answers: nextAnswers, ...(completedAt ? { completedAt } : {}) } },
    };
    try {
      storage.setItem(preparationStorageKey, JSON.stringify({ version: 1, progress: [...library.progress.filter(record => record.bookingId !== booking.id), next] } satisfies Library));
    } catch {
      throw new Error("Your preparation could not be saved. Free up browser storage and try again; your current answer is still here.");
    }
    if (typeof window !== "undefined") window.dispatchEvent(new Event(changed));
    return structuredClone(next);
  });
}

export function subscribePreparation(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => { if (event.key === preparationStorageKey || event.key === null) callback(); };
  window.addEventListener(changed, callback);
  window.addEventListener("storage", onStorage);
  return () => { window.removeEventListener(changed, callback); window.removeEventListener("storage", onStorage); };
}
