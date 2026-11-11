import { students, type Lesson } from "./model.ts";
import {
  cloneCourse,
  coursePatch,
  courseIssues,
  id,
  readyTemplates,
  type CourseTemplate,
  type Course,
} from "./course.ts";

const key = "mimo.lesson-library.v1";
type Library = { version: 1; lessons: Lesson[]; templates: CourseTemplate[] };
function readStoredLibrary(): Library {
    const raw = localStorage.getItem(key);
    if (raw === null) return { version: 1, lessons: [], templates: [] };
    const parsed = JSON.parse(
      raw,
      // Only canonicalize the old stored enum, including saved/applied courses.
      // User-authored text and the stored snapshot itself remain untouched.
      (field, value) => field === "purpose" && value === "Practise" ? "Practice" : value,
    );
    if (
      parsed?.version === 1 &&
      Array.isArray(parsed.lessons) &&
      parsed.lessons.every((lesson: Lesson) => lesson && typeof lesson.id === "string" && Array.isArray(lesson.blocks)) &&
      Array.isArray(parsed.templates) &&
      parsed.templates.every((template: CourseTemplate) => template && typeof template.id === "string" && template.content && Array.isArray(template.content.modules))
    )
      return parsed;
    throw new Error("Saved lessons could not be read. Reload and retry before saving; the existing library has not been changed.");
}
export function readLibrary(): Library {
  try {
    return readStoredLibrary();
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
  const old = readStoredLibrary();
  const existing = old.lessons.find(item => item.id === lesson.id);
  const saved = { ...lesson, ...(existing?.publishedEditor ? { publishedEditor: existing.publishedEditor } : {}), ...(existing?.sharedVersion ? { sharedVersion: existing.sharedVersion } : {}) };
  localStorage.setItem(
    key,
    JSON.stringify({
      version: 1,
      lessons: [...old.lessons.filter((l) => l.id !== lesson.id), saved],
      templates: [...new Map([...old.templates, ...templates].map(template => [template.id, template])).values()],
    } satisfies Library),
  );
  return saved;
}

export class LessonUseError extends Error {
  field?: "student" | "template";
  constructor(message: string, field?: "student" | "template") { super(message); this.field = field; }
}

/** A source lesson can be assigned once to each student. Existing work is never replaced. */
export function hasLessonAssignment(lessons: Lesson[], sourceId: string, studentId: string): boolean {
  return lessons.some(lesson => (lesson.id === sourceId || lesson.sourceId === sourceId)
    && (lesson.publishedEditor?.studentId === studentId || (lesson.status === "Shared" && lesson.studentId === studentId)));
}

export type LessonUseRequest = { lesson: Lesson; course: Course; templates: CourseTemplate[]; studentId?: string; templateName?: string };
export async function writeLessonUse(request: LessonUseRequest): Promise<{ draft: Lesson; assignment?: Lesson; templates: CourseTemplate[] }> {
  const input = structuredClone(request);
  const write = () => {
    const old = readStoredLibrary();
    const { lesson, course, studentId, templateName } = input;
    if (studentId === undefined && templateName === undefined) throw new LessonUseError("Choose at least one option to continue.");
    if (studentId !== undefined && !students.some(student => student.id === studentId)) throw new LessonUseError("Choose a student.", "student");
    if (templateName !== undefined && !templateName.trim()) throw new LessonUseError("Enter a template name.", "template");
    const issues = courseIssues(course);
    if (issues.length) throw new LessonUseError(issues.join("\n"));
    if (studentId && hasLessonAssignment(old.lessons, lesson.id, studentId)) throw new LessonUseError("This lesson is already assigned to this student. Their assigned version and work are unchanged. Create a separate lesson to assign new material.", "student");
    const now = new Date().toISOString();
    const existing = old.lessons.find(item => item.id === lesson.id);
    const draft: Lesson = { ...lesson, ...coursePatch(structuredClone(course)), savedEditor: structuredClone(course), savedAt: now,
      ...(existing?.publishedEditor ? { publishedEditor: existing.publishedEditor } : {}), ...(existing?.sharedVersion ? { sharedVersion: existing.sharedVersion } : {}),
    };
    const assignment: Lesson | undefined = studentId ? {
      id: id(), sourceId: lesson.id, studentId, notes: "", archived: false,
      ...coursePatch(structuredClone(course)),
      title: course.title, outcome: course.goal, language: course.language, level: course.level,
      blocks: coursePatch(course).blocks!, course: structuredClone(course), savedEditor: structuredClone(course), savedAt: now,
      publishedEditor: { content: structuredClone(course), studentId, appliedAt: now }, status: "Shared",
    } : undefined;
    const template: CourseTemplate | undefined = templateName !== undefined
      ? { id: id(), name: templateName.trim(), level: course.level, content: cloneCourse(course), own: true } : undefined;
    const templates = [...new Map([...old.templates, ...input.templates, ...(template ? [template] : [])].map(item => [item.id, item])).values()];
    // One browser-local write commits the private draft, assignment and template together.
    localStorage.setItem(key, JSON.stringify({ version: 1, lessons: [...old.lessons.filter(item => item.id !== lesson.id), draft, ...(assignment ? [assignment] : [])], templates } satisfies Library));
    return { draft, assignment, templates };
  };
  const locks = typeof window === "undefined" || typeof navigator === "undefined" ? undefined : navigator.locks;
  return locks ? locks.request(`${key}.use`, write) : write();
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
