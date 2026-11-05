import type { Route } from "./model";

// Review links select an initial screen; they never execute an editor action.
export function teacherEntryRoute(search: string, lessonIds: string[]): Route {
  const params = new URLSearchParams(search);
  const flow = params.get("flow");
  if (flow === "editor" || flow === "preview") {
    const lesson = params.get("lesson") || "cafe";
    return lessonIds.includes(lesson)
      ? { page: flow === "editor" ? "editor" : "lesson-preview", id: lesson }
      : { page: "lessons", tab: "Library" };
  }
  if (flow === "lessons") return { page: "lessons", tab: "Library" };
  if (flow === "schedule" || flow === "profile" || flow === "students")
    return { page: flow };
  return { page: "students" };
}
