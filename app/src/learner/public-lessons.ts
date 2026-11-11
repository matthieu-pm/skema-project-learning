export type PublicLesson = {
  id: string;
  teacherId: string;
  title: string;
  language: string;
  level: string;
  minutes: number;
  description: string;
  outcomes: string[];
  modules: {
    id: string;
    title: string;
    minutes: number;
    blockCount: number;
    preview?: string;
  }[];
};

// Public learner-facing content verified in the Mimo Students Figma file:
// Teacher profile: https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=14-545
// Lesson overview: https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=14-621
// Curriculum: https://www.figma.com/design/zyO4CpoehoiqFHa8MCAaRr?node-id=97-2345
// This public outline is independent of private teacher drafts and learner submissions.
export const publicLessons: PublicLesson[] = [
  {
    id: "gilbert-cafe",
    teacherId: "gilbert",
    title: "A conversation at the café",
    language: "French",
    level: "A2",
    minutes: 30,
    description: "Order a drink and ask a natural follow-up question. Practice useful words, build your sentence and try it with your teacher.",
    outcomes: [
      "Order a drink politely",
      "Ask a natural follow-up question",
      "Try it in your own words",
    ],
    modules: [
      { id: "cafe-warm-up", title: "Warm-up", minutes: 5, blockCount: 1, preview: "Vocabulary recall · Practice" },
      { id: "cafe-vocabulary", title: "Vocabulary", minutes: 5, blockCount: 2 },
      { id: "cafe-grammar", title: "Grammar", minutes: 5, blockCount: 2 },
      { id: "cafe-listening", title: "Listening", minutes: 5, blockCount: 2 },
      { id: "cafe-speaking", title: "Speaking", minutes: 5, blockCount: 1 },
      { id: "cafe-reflection", title: "Reflection", minutes: 5, blockCount: 1 },
    ],
  },
];

export function publicLessonsForTeacher(teacherId: string): PublicLesson[] {
  return publicLessons.filter((lesson) => lesson.teacherId === teacherId);
}
