import { teachers } from "./model.ts";

export type ChatMessage = { id: string; teacherId: string; from: "learner" | "teacher"; text: string; at: string };
type Store = { version: 1; messages: ChatMessage[]; read: Record<string, string> };
export const messagesStorageKey = "mimo.learner-messages.v1";
const changed = "mimo-learner-messages-changed";
type StorageLike = Pick<Storage, "getItem" | "setItem">;
const storage = (custom?: StorageLike) => custom ?? window.localStorage;

/**
 * Conversations a returning learner already has: their current teacher (Gilbert)
 * and three past teachers, so Messages is never an empty shell.
 */
function seed(now: Date): Store {
  const at = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60_000).toISOString();
  const day = 60 * 24;
  const messages: ChatMessage[] = [
    { id: "seed-1", teacherId: "gilbert", from: "teacher", text: "Bonjour ! I’ve added a short café lesson for our next session. Try the first two blocks if you have time.", at: at(60 * 22) },
    { id: "seed-2", teacherId: "gilbert", from: "learner", text: "Merci! I’ll do them tonight.", at: at(60 * 21) },
    { id: "seed-3", teacherId: "gilbert", from: "teacher", text: "Parfait. See you soon!", at: at(60 * 20) },
    { id: "seed-emma-1", teacherId: "emma", from: "learner", text: "Thanks for today, Emma. The tips for my presentation really helped.", at: at(2 * day - 60) },
    { id: "seed-emma-2", teacherId: "emma", from: "teacher", text: "You did great! Practice the opening line out loud a few times before Friday.", at: at(2 * day - 90) },
    { id: "seed-emma-3", teacherId: "emma", from: "learner", text: "Will do. I’ll let you know how it goes.", at: at(2 * day - 100) },
    { id: "seed-sofia-1", teacherId: "sofia", from: "teacher", text: "Ciao! Here are the restaurant phrases we covered: “Vorrei…”, “Il conto, per favore”.", at: at(9 * day) },
    { id: "seed-sofia-2", teacherId: "sofia", from: "learner", text: "Grazie mille! I used them in Rome last weekend.", at: at(6 * day) },
    { id: "seed-sofia-3", teacherId: "sofia", from: "teacher", text: "Bravissima! Book another lesson whenever you’re ready.", at: at(6 * day - 30) },
    { id: "seed-diego-1", teacherId: "diego", from: "learner", text: "Hola Diego, could we focus on travel vocabulary next time?", at: at(21 * day) },
    { id: "seed-diego-2", teacherId: "diego", from: "teacher", text: "¡Claro! I’ll bring some airport and hotel situations.", at: at(21 * day - 45) },
    { id: "seed-diego-3", teacherId: "diego", from: "learner", text: "Perfect, gracias!", at: at(21 * day - 50) },
  ];
  const read = Object.fromEntries([...new Set(messages.map(m => m.teacherId))].map(id => [id, messages.filter(m => m.teacherId === id).map(m => m.at).sort().at(-1)!]));
  return { version: 1, read, messages };
}
const valid = (m: unknown): m is ChatMessage => !!m && typeof m === "object" && typeof (m as ChatMessage).id === "string"
  && teachers.some(t => t.id === (m as ChatMessage).teacherId) && ["learner", "teacher"].includes((m as ChatMessage).from)
  && typeof (m as ChatMessage).text === "string" && Number.isFinite(Date.parse((m as ChatMessage).at));
export function readStore(options: { storage?: StorageLike; now?: Date } = {}): Store {
  try {
    const raw = storage(options.storage).getItem(messagesStorageKey);
    if (raw === null) return seed(options.now ?? new Date());
    const data = JSON.parse(raw);
    if (data?.version !== 1 || !Array.isArray(data.messages) || !data.messages.every(valid) || typeof data.read !== "object") throw new Error();
    // Learners who opened Messages before the past-teacher threads existed still get them.
    const sample = seed(options.now ?? new Date()), have = new Set((data as Store).messages.map(m => m.id));
    const missing = sample.messages.filter(m => !have.has(m.id) && !(data as Store).messages.some(x => x.teacherId === m.teacherId && !x.id.startsWith("seed-")));
    if (!missing.length) return data;
    const read = { ...(data as Store).read };
    for (const m of missing) if (!read[m.teacherId]) read[m.teacherId] = sample.read[m.teacherId];
    return { ...(data as Store), read, messages: [...(data as Store).messages, ...missing] };
  } catch { return seed(options.now ?? new Date()); }
}
function write(store: Store, options: { storage?: StorageLike } = {}) {
  try { storage(options.storage).setItem(messagesStorageKey, JSON.stringify(store)); }
  catch { throw new Error("Your message couldn’t be sent. Check your connection and try again."); }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(changed));
}
export function conversation(store: Store, teacherId: string) {
  return store.messages.filter(m => m.teacherId === teacherId).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}
export function unreadCount(store: Store, teacherId?: string) {
  return store.messages.filter(m => m.from === "teacher" && (!teacherId || m.teacherId === teacherId) && Date.parse(m.at) > Date.parse(store.read[m.teacherId] || "1970-01-01")).length;
}
/** One row per teacher, newest conversation first. */
export function inbox(store: Store) {
  const ids = [...new Set(store.messages.map(m => m.teacherId))];
  return ids.map(id => { const thread = conversation(store, id); return { teacherId: id, last: thread.at(-1)!, unread: unreadCount(store, id) }; })
    .sort((a, b) => Date.parse(b.last.at) - Date.parse(a.last.at));
}
export function markRead(teacherId: string, options: { storage?: StorageLike; now?: Date } = {}) {
  const store = readStore(options), last = conversation(store, teacherId).at(-1);
  if (!last || store.read[teacherId] && Date.parse(store.read[teacherId]) >= Date.parse(last.at)) return;
  try { write({ ...store, read: { ...store.read, [teacherId]: last.at } }, options); } catch { /* read state is best effort */ }
}
const replies = [
  "Thanks for your message! I’ll get back to you soon.",
  "Great question. Let’s go through it together when we meet.",
  "Sounds good. I’ll prepare something around that for you.",
];
export function sendMessage(teacherId: string, text: string, options: { storage?: StorageLike; now?: Date; replyDelay?: number } = {}): ChatMessage {
  const body = text.trim();
  if (!body) throw new Error("Write a message before sending.");
  const store = readStore(options), now = options.now ?? new Date();
  const message: ChatMessage = { id: `m-${globalThis.crypto.randomUUID()}`, teacherId, from: "learner", text: body, at: now.toISOString() };
  write({ ...store, messages: [...store.messages, message], read: { ...store.read, [teacherId]: now.toISOString() } }, options);
  // The teacher replies a moment later, like a real chat.
  const sent = conversation(store, teacherId).filter(m => m.from === "learner").length;
  if (typeof window !== "undefined") window.setTimeout(() => {
    const latest = readStore(options);
    const reply: ChatMessage = { id: `m-${globalThis.crypto.randomUUID()}`, teacherId, from: "teacher", text: replies[sent % replies.length], at: new Date().toISOString() };
    try { write({ ...latest, messages: [...latest.messages, reply] }, options); } catch { /* the learner's own message is already saved */ }
  }, options.replyDelay ?? 1800);
  return message;
}
export function subscribeMessages(callback: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === messagesStorageKey || event.key === null) callback(); };
  window.addEventListener(changed, callback); window.addEventListener("storage", onStorage);
  return () => { window.removeEventListener(changed, callback); window.removeEventListener("storage", onStorage); };
}
