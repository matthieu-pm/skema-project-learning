import { autoAssessed, readyTemplates, type Course, type CourseBlock } from "../teacher/course.ts";
import type { Booking } from "./model.ts";

export type Preparation = { id: string; teacherId: string; course: Course };
// An immutable, versioned sample assignment, never a live teacher draft.
const course = readyTemplates()[0].content;
course.level = "A2";
course.modules[3].blocks[0].clips[0].transcript = "Bonjour ! Qu’est-ce que vous voulez ? Je voudrais un café, s’il vous plaît. Bien sûr. Vous voulez autre chose ? Non merci. Est-ce que je peux payer par carte ?";
course.modules.forEach((module, m) => {
  module.id = `cafe-module-${m + 1}`;
  module.blocks.forEach((block, b) => {
    block.id = `${module.id}-block-${b + 1}`;
    block.words.forEach((word, i) => { word.id = `${block.id}-word-${i + 1}`; });
    block.parts.forEach((part, i) => { part.id = `${block.id}-part-${i + 1}`; });
    block.pairs.forEach((pair, i) => { pair.id = `${block.id}-pair-${i + 1}`; });
    block.clips.forEach((clip, i) => { clip.id = `${block.id}-clip-${i + 1}`; });
  });
});
const cafe: Preparation = { id: "cafe-a2-v1", teacherId: "gilbert", course };
export const preparationIdForTeacher = (teacherId: string) => teacherId === cafe.teacherId ? cafe.id : undefined;
export function preparationFor(booking: Pick<Booking, "teacherId" | "preparationId">): Preparation | undefined {
  // Explicit compatibility for existing Gilbert sample bookings without an ID.
  const id = booking.preparationId ?? preparationIdForTeacher(booking.teacherId);
  return id === cafe.id && booking.teacherId === cafe.teacherId ? cafe : undefined;
}
export const preparationBlocks = (preparation: Preparation) => preparation.course.modules.flatMap(module => module.blocks.map(block => ({ module, block })));
export type BlockAttempt = {
  answers: Record<string, string>; order: string[]; submitted: string[]; revealed: string[];
  acknowledged: boolean; completedAt?: string;
};
export type PreparationProgress = { blocks: Record<string, BlockAttempt> };
export const emptyAttempt = (): BlockAttempt => ({ answers: {}, order: [], submitted: [], revealed: [], acknowledged: false });
export function answerItems(block: CourseBlock) {
  return ["Vocabulary recall", "Flashcards"].includes(block.format) && block.purpose === "Practice" ? block.words.map(word => word.id) : ["activity"];
}
export function attemptComplete(block: CourseBlock, attempt: BlockAttempt): boolean {
  if (block.purpose === "Teach") return attempt.acknowledged && (block.format !== "Flashcards" || block.words.every(word => attempt.revealed.includes(word.id)));
  if (!autoAssessed(block)) return !!attempt.answers.response?.trim() && attempt.submitted.includes("response");
  const answered = ["Matching pairs", "Word sorting"].includes(block.format) ? block.pairs.every(pair => attempt.answers[pair.id]?.trim())
    : block.format === "Sentence construction" ? block.parts.length === attempt.order.length && block.parts.every(part => attempt.order.includes(part.id))
    : answerItems(block).every(id => attempt.answers[id]?.trim());
  return answered && answerItems(block).every(id => attempt.submitted.includes(id) && attempt.revealed.includes(id));
}
export function preparationCounts(preparation: Preparation, progress: PreparationProgress) {
  const blocks = preparationBlocks(preparation), completed = blocks.filter(({ block }) => progress.blocks[block.id]?.completedAt).length;
  return { completed, total: blocks.length, percent: blocks.length ? Math.round(completed / blocks.length * 100) : 0 };
}

export const preparationStorageKey = "mimo.session-preparation.v1";
const changed = "mimo-session-preparation-changed";
type StorageLike = Pick<Storage, "getItem" | "setItem">;
type Options = { storage?: StorageLike; locks?: { request: <T>(name: string, fn: () => T | Promise<T>) => Promise<T> } | null; now?: Date };
type Store = { version: 1; sessions: Record<string, PreparationProgress> };
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const storageFor = (options: Options) => options.storage ?? window.localStorage;
function readStore(options: Options): Store {
  try {
    const raw = storageFor(options).getItem(preparationStorageKey);
    if (raw === null) return { version: 1, sessions: {} };
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data.version !== 1 || !isRecord(data.sessions)) throw new Error();
    return data as Store;
  } catch { throw new Error("Saved preparation could not be read. Reload and try again; your saved work has not been replaced."); }
}
function validAttempt(value: unknown, block: CourseBlock): value is BlockAttempt {
  if (!isRecord(value) || !isRecord(value.answers)) return false;
  const keys = new Set(["activity", "response", ...block.words.map(word => word.id), ...block.pairs.map(pair => pair.id)]);
  return Object.entries(value.answers).every(([key, answer]) => keys.has(key) && typeof answer === "string" && answer.length <= 4000)
    && [value.order, value.submitted, value.revealed].every(list => Array.isArray(list) && list.every(item => typeof item === "string") && new Set(list).size === list.length)
    && (value.order as string[]).every(id => block.parts.some(part => part.id === id))
    && [...value.submitted as string[], ...value.revealed as string[]].every(id => keys.has(id))
    && typeof value.acknowledged === "boolean" && (value.completedAt === undefined || typeof value.completedAt === "string" && Number.isFinite(Date.parse(value.completedAt)));
}
const sessionKey = (booking: Booking, preparation: Preparation) => `${booking.id}:${preparation.id}`;
function progressFrom(store: Store, booking: Booking, preparation: Preparation): PreparationProgress {
  const progress = store.sessions[sessionKey(booking, preparation)];
  if (!progress) return { blocks: {} };
  if (!isRecord(progress) || !isRecord(progress.blocks) || !Object.entries(progress.blocks).every(([id, attempt]) => {
    const entry = preparationBlocks(preparation).find(({ block }) => block.id === id);
    return entry && validAttempt(attempt, entry.block);
  })) throw new Error("Saved preparation could not be read. Reload and try again; your saved work has not been replaced.");
  return progress;
}
export function readPreparation(booking: Booking, options: Options = {}): PreparationProgress {
  const preparation = preparationFor(booking);
  return preparation ? progressFrom(readStore(options), booking, preparation) : { blocks: {} };
}
export async function savePreparation(booking: Booking, blockId: string, attempt: BlockAttempt, options: Options = {}): Promise<PreparationProgress> {
  const preparation = preparationFor(booking), block = preparation && preparationBlocks(preparation).find(entry => entry.block.id === blockId)?.block;
  if (booking.status !== "confirmed" || !preparation || !block || !validAttempt(attempt, block)) throw new Error("This session or preparation block is unavailable. Your saved work is unchanged.");
  const locks = options.locks !== undefined ? options.locks : navigator.locks;
  if (!locks) throw new Error("This browser cannot safely save preparation. Use a browser with Web Locks support.");
  const snapshot = structuredClone(attempt);
  return locks.request(preparationStorageKey, () => {
    const store = readStore(options), progress = progressFrom(store, booking, preparation);
    const completedAt = progress.blocks[blockId]?.completedAt ?? (attemptComplete(block, snapshot) ? (options.now ?? new Date()).toISOString() : undefined);
    const next = { blocks: { ...progress.blocks, [blockId]: { ...snapshot, completedAt } } };
    try { storageFor(options).setItem(preparationStorageKey, JSON.stringify({ ...store, sessions: { ...store.sessions, [sessionKey(booking, preparation)]: next } })); }
    catch { throw new Error("Your progress could not be saved. Keep this page open and try saving again."); }
    if (typeof window !== "undefined") window.dispatchEvent(new Event(changed));
    return next;
  });
}
export function subscribePreparation(callback: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === preparationStorageKey || event.key === null) callback(); };
  window.addEventListener(changed, callback); window.addEventListener("storage", onStorage);
  return () => { window.removeEventListener(changed, callback); window.removeEventListener("storage", onStorage); };
}
