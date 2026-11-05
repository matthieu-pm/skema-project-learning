import type { Lesson } from "./model";
import {
  cloneCourse,
  coursePatch,
  readyTemplates,
  type CourseTemplate,
} from "./course.ts";

const key = "mimo.lesson-library.v1";
type Library = { version: 1; lessons: Lesson[]; templates: CourseTemplate[] };
export function readLibrary(): Library {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    if (
      parsed?.version === 1 &&
      Array.isArray(parsed.lessons) &&
      Array.isArray(parsed.templates)
    )
      return parsed;
  } catch {
    /* Storage may be unavailable. Keep the sample workspace usable. */
  }
  return { version: 1, lessons: [], templates: [] };
}
export function restoreLessons(seed: Lesson[]): Lesson[] {
  const cafe = readyTemplates()[0].content;
  seed = seed.map((l) =>
    l.id.includes("cafe")
      ? {
          ...l,
          ...coursePatch({
            ...cloneCourse(cafe),
            title: l.title,
            goal: l.outcome,
            level: l.level,
          }),
          status: l.status,
        }
      : l,
  );
  const saved = readLibrary().lessons.filter(
    (l) =>
      typeof l.id === "string" &&
      Array.isArray(l.blocks) &&
      (!l.course || Array.isArray(l.course.modules)),
  );
  return [...seed.filter((l) => !saved.some((s) => s.id === l.id)), ...saved];
}
// Save one explicit draft, never silently save another lesson's working edits.
export function writeDraft(lesson: Lesson, templates: CourseTemplate[]) {
  const old = readLibrary();
  localStorage.setItem(
    key,
    JSON.stringify({
      version: 1,
      lessons: [...old.lessons.filter((l) => l.id !== lesson.id), lesson],
      templates,
    } satisfies Library),
  );
}

// Media is stored separately so larger files do not exhaust localStorage.
function mediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("mimo-lesson-media", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function saveMedia(file: File): Promise<string> {
  if (file.size > 20 * 1024 * 1024)
    throw new Error("Choose a file smaller than 20 MB.");
  const db = await mediaDB(),
    mediaId = crypto.randomUUID();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").put(file, mediaId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    return mediaId;
  } finally {
    db.close();
  }
}
export async function loadMedia(mediaId: string): Promise<Blob | undefined> {
  const db = await mediaDB();
  try {
    return await new Promise<Blob | undefined>((resolve, reject) => {
      const req = db.transaction("files").objectStore("files").get(mediaId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}
