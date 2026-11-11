// Public sample from Mimo Students: teacher 14:545, overview 14:621,
// curriculum 97:2345. Separate from private teacher drafts and answer keys.
export type PublicLesson = {
  id: string;
  teacherId: string;
  title: string;
  language: string;
  level: string;
  greeting: string;
  description: string;
  goals: string[];
  modules: { title: string; minutes: number; blocks: { title: string; purpose: "Teach" | "Practice" }[] }[];
};

const cafe: PublicLesson = {
  id: "cafe", teacherId: "gilbert", title: "A conversation at the café",
  language: "French", level: "A2", greeting: "Bonjour !",
  description: "Order a drink and ask a natural follow-up question. Practice useful words, build your sentence and try it with your teacher.",
  goals: ["Order a drink politely", "Ask a natural follow-up question", "Try it in your own words"],
  modules: [
    { title: "Warm-up", minutes: 5, blocks: [{ title: "Vocabulary recall", purpose: "Practice" }] },
    { title: "Vocabulary", minutes: 5, blocks: [{ title: "Flashcards", purpose: "Teach" }, { title: "Matching pairs", purpose: "Practice" }] },
    { title: "Grammar", minutes: 5, blocks: [{ title: "Sentence construction", purpose: "Teach" }, { title: "Sentence construction", purpose: "Practice" }] },
    { title: "Listening", minutes: 5, blocks: [{ title: "Audio", purpose: "Teach" }, { title: "Written response", purpose: "Practice" }] },
    { title: "Speaking", minutes: 5, blocks: [{ title: "Spoken response", purpose: "Practice" }] },
    { title: "Reflection", minutes: 5, blocks: [{ title: "Lesson recap", purpose: "Teach" }] },
  ],
};

// The supplied design publishes Gilbert's café lesson only. Other fictional
// teachers have an explicit empty state instead of borrowing his curriculum.
export function publicLessonFor(teacherId: string) {
  return teacherId === cafe.teacherId ? cafe : undefined;
}
export function curriculumSummary(lesson: PublicLesson) {
  return {
    modules: lesson.modules.length,
    blocks: lesson.modules.reduce((sum, module) => sum + module.blocks.length, 0),
    minutes: lesson.modules.reduce((sum, module) => sum + module.minutes, 0),
  };
}
