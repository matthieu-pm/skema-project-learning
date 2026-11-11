import { lessonPublicationIssues } from "../lesson-settings.ts";
import { cloneCourse, courseIssues, coursePatch, id, type Course, type CourseTemplate } from "./course.ts";
import { learnerMaterial, students, type Lesson, type Profile } from "./model.ts";

export type UseChoices = { assign: boolean; studentId: string; template: boolean; templateName: string };
export type UseErrors = { student?: string; templateName?: string; content: string[] };
export function useLessonErrors(lesson: Lesson, course: Course, profile: Profile, choices: UseChoices): UseErrors {
  const errors: UseErrors = { content: [] };
  if (choices.assign) {
    if (!students.some(student => student.id === choices.studentId)) errors.student = "Choose a student.";
    else if (lesson.assignments?.some(assignment => assignment.studentId === choices.studentId) || lesson.publishedEditor?.studentId === choices.studentId || lesson.status === "Shared" && lesson.studentId === choices.studentId)
      errors.student = "This lesson is already assigned to this student. Make a separate lesson copy to assign another version; their existing work is unchanged.";
  }
  if (choices.template && !choices.templateName.trim()) errors.templateName = "Enter a template name.";
  if (choices.assign || choices.template) errors.content = [...courseIssues(course), ...lessonPublicationIssues(profile, choices.assign)];
  return errors;
}
export function prepareLessonUse(lesson: Lesson, course: Course, templates: CourseTemplate[], choices: UseChoices, now = new Date().toISOString()) {
  const draft: Lesson = { ...lesson, ...coursePatch(structuredClone(course)), savedEditor: structuredClone(course), savedAt: now };
  let assigned: Lesson | undefined;
  if (choices.assign) {
    const assignment = { id: id(), studentId: choices.studentId, content: structuredClone(course), appliedAt: now };
    draft.assignments = [...(lesson.assignments || []), assignment];
    if (!lesson.publishedEditor?.studentId) draft.publishedEditor = assignment;
    assigned = { ...structuredClone(draft), id: assignment.id, sourceId: lesson.id, studentId: choices.studentId, notes: "", status: "Shared", assignments: undefined, publishedEditor: structuredClone(assignment) };
    assigned.sharedVersion = learnerMaterial(assigned);
  }
  const nextTemplates = choices.template ? [...templates, { id: id(), name: choices.templateName.trim(), level: course.level, content: cloneCourse(course), own: true }] : templates;
  return { draft, assigned, templates: nextTemplates };
}
