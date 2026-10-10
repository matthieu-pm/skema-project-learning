import type { Answers } from "../onboarding";
export type Student = {
  id: string;
  name: string;
  initials: string;
  color: string;
  language: string;
  level: string;
  goal: string;
  focus: string;
  next: string;
};
export type Block = {
  id: string;
  type: string;
  title: string;
  content: string;
  minutes: number;
};
export type Lesson = {
  id: string;
  title: string;
  outcome: string;
  language: string;
  level: string;
  blocks: Block[];
  notes: string;
  studentId?: string;
  status: "Draft" | "Approved" | "Shared";
  archived: boolean;
  sourceId?: string;
  sharedVersion?: ReturnType<typeof learnerMaterial>;
};
export type Session = {
  id: string;
  studentId: string;
  date: string;
  time: string;
  duration: number;
  format: "Online" | "In person";
  status:
    "Confirmed" | "Requested" | "Completed" | "Cancelled" | "Issue recorded";
  lessonId: string;
  pending?: { date: string; time: string };
  notes: string;
  recap: string;
  practice: string;
  recapShared: boolean;
  lessonSnapshot?: Lesson;
  liveFeedback?: string;
  issue?: string;
};
export type Profile = {
  name: string;
  languages: string;
  levels: string;
  approach: string;
  format: string;
  city: string;
  duration: string;
  rate: string;
  identity: boolean;
};
export type Route = { page: string; id?: string; tab?: string };
export const uid = () => crypto.randomUUID();
export const students: Student[] = [
  {
    id: "lea",
    name: "Léa Martin",
    initials: "LM",
    color: "peach",
    language: "French",
    level: "A2",
    goal: "Order at a café and keep the conversation going.",
    focus: "Asking follow-up questions",
    next: "Today, 14:00",
  },
  {
    id: "lucas",
    name: "Lucas Bernard",
    initials: "LB",
    color: "blue",
    language: "English",
    level: "B1",
    goal: "Understand natural conversations when travelling.",
    focus: "Listening for connected speech",
    next: "Today, 16:00",
  },
  {
    id: "maya",
    name: "Maya Kapoor",
    initials: "MK",
    color: "lilac",
    language: "French",
    level: "B2",
    goal: "Present an idea confidently in a work meeting.",
    focus: "Structuring an opinion",
    next: "Monday, 10:00",
  },
  {
    id: "noah",
    name: "Noah Rossi",
    initials: "NR",
    color: "green",
    language: "English",
    level: "A2",
    goal: "Make small talk with new colleagues.",
    focus: "Starting a conversation",
    next: "Meeting request",
  },
];
export const makeBlocks = (): Block[] => [
  {
    id: uid(),
    type: "Warm-up",
    title: "A little hello",
    content: "What is your favourite café? Describe it in three sentences.",
    minutes: 5,
  },
  {
    id: uid(),
    type: "Vocabulary",
    title: "Words you can use",
    content:
      "Je voudrais… · Sur place ou à emporter ? · Vous me conseillez quoi ?",
    minutes: 8,
  },
  {
    id: uid(),
    type: "Role-play",
    title: "Your turn to order",
    content:
      "You are at a café. Order a drink, ask a question, and respond to the barista.",
    minutes: 12,
  },
  {
    id: uid(),
    type: "Reflection",
    title: "Make it your own",
    content: "Which phrase feels most useful? Try it in a new situation.",
    minutes: 5,
  },
];
export function initialLessons(): Lesson[] {
  return [
    {
      id: "cafe",
      title: "A conversation at the café",
      outcome: "Order a drink and ask a natural follow-up question.",
      language: "French",
      level: "A2",
      blocks: makeBlocks(),
      notes:
        "Give the learner time to respond. Correct gently after the conversation.",
      status: "Approved",
      archived: false,
    },
    {
      id: "lea-cafe",
      sourceId: "cafe",
      studentId: "lea",
      title: "A conversation at the café",
      outcome: "Order a drink and keep a short conversation going.",
      language: "French",
      level: "A2",
      blocks: makeBlocks(),
      notes: "Léa prefers to practise once before trying without prompts.",
      status: "Approved",
      archived: false,
    },
    {
      id: "travel",
      title: "Listen like a local",
      outcome: "Recognise key information in a natural travel conversation.",
      language: "English",
      level: "B1",
      blocks: [
        {
          id: uid(),
          type: "Listening",
          title: "Catch the meaning",
          content:
            "Read this exchange aloud at a natural pace: “Where are you headed?” “I’m on my way to the station.” Ask the learner to explain the main idea.",
          minutes: 10,
        },
        {
          id: uid(),
          type: "Role-play",
          title: "Ask for directions",
          content:
            "Take turns asking for directions and checking what you heard.",
          minutes: 15,
        },
      ],
      notes: "Use a slower second reading if needed.",
      status: "Draft",
      archived: false,
    },
    {
      id: "meeting",
      title: "An idea worth sharing",
      outcome: "Present an opinion with a reason and an example.",
      language: "French",
      level: "B2",
      blocks: [
        {
          id: uid(),
          type: "Speaking",
          title: "One idea, clearly",
          content:
            "Présentez une idée avec : à mon avis, parce que, par exemple.",
          minutes: 15,
        },
      ],
      notes: "Focus on clarity before accuracy.",
      status: "Approved",
      archived: false,
    },
  ];
}
export function initialSessions(): Session[] {
  return [
    {
      id: "s1",
      studentId: "lea",
      date: "2026-10-10",
      time: "14:00",
      duration: 30,
      format: "Online",
      status: "Confirmed",
      lessonId: "lea-cafe",
      notes: "Practise ordering, then remove the prompts.",
      recap: "",
      practice: "",
      recapShared: false,
    },
    {
      id: "s2",
      studentId: "lucas",
      date: "2026-10-10",
      time: "16:00",
      duration: 45,
      format: "Online",
      status: "Confirmed",
      lessonId: "travel",
      notes: "",
      recap: "",
      practice: "",
      recapShared: false,
    },
    {
      id: "s3",
      studentId: "maya",
      date: "2026-10-12",
      time: "10:00",
      duration: 45,
      format: "In person",
      status: "Confirmed",
      lessonId: "meeting",
      notes: "",
      recap: "",
      practice: "",
      recapShared: false,
    },
    {
      id: "s4",
      studentId: "noah",
      date: "2026-10-13",
      time: "11:00",
      duration: 30,
      format: "Online",
      status: "Requested",
      lessonId: "travel",
      notes: "",
      recap: "",
      practice: "",
      recapShared: false,
    },
    {
      id: "s5",
      studentId: "lea",
      date: "2026-10-08",
      time: "14:00",
      duration: 30,
      format: "Online",
      status: "Completed",
      lessonId: "lea-cafe",
      notes:
        "Léa ordered confidently. Follow-up questions needed another example.",
      recap:
        "You ordered confidently and asked for a recommendation. Next time, we’ll practise a spontaneous follow-up question.",
      practice:
        "Try asking “Vous me conseillez quoi ?” in a café, if you have a chance.",
      recapShared: false,
    },
  ];
}
export function initialProfile(a?: Answers): Profile {
  return {
    name: a?.name || "Gilbert",
    languages: a?.teachingLanguages.join(", ") || "French, English",
    levels: a?.teachingLevels.join(", ") || "A1, A2, B1, B2",
    approach:
      a?.approach ||
      "Practical conversations, thoughtful feedback, and lessons that feel like you.",
    format: a?.format || "Either",
    city: a?.city || "Paris, France",
    duration: a?.duration || "30 minutes",
    rate: a?.rate || "30",
    identity: a?.identityPreviewComplete || false,
  };
}
export function lessonValid(l: Lesson) {
  return (
    l.title.trim().length >= 3 &&
    l.outcome.trim().length >= 5 &&
    l.blocks.length > 0 &&
    l.blocks.every(
      (b) =>
        b.title.trim() &&
        b.content.trim() &&
        Number.isFinite(b.minutes) &&
        b.minutes > 0,
    )
  );
}
export function overlaps(
  sessions: Session[],
  date: string,
  time: string,
  duration: number,
  except?: string,
) {
  const start = time.split(":").reduce((h, m) => h * 60 + Number(m), 0);
  return sessions.some((s) => {
    if (s.id === except || s.date !== date || s.status !== "Confirmed")
      return false;
    const other = s.time.split(":").reduce((h, m) => h * 60 + Number(m), 0);
    return start < other + s.duration && start + duration > other;
  });
}
export function dateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
export const primaryTab = (r: Route) =>
  [
    "students",
    "student",
    "modules",
    "results",
    "messages",
    "submission",
    "feedback-preview",
  ].includes(r.page)
    ? "students"
    : [
          "schedule",
          "session",
          "availability",
          "reschedule",
          "cancel",
          "issue",
          "lobby",
          "live",
          "recap",
          "recap-preview",
        ].includes(r.page)
      ? "schedule"
      : ["lessons", "editor", "lesson-preview", "ai-review", "share"].includes(
            r.page,
          )
        ? "lessons"
        : "profile";
export function learnerMaterial(lesson: Lesson) {
  return {
    title: lesson.title,
    outcome: lesson.outcome,
    language: lesson.language,
    level: lesson.level,
    blocks: lesson.blocks.map(({ type, title, content, minutes }) => ({
      type,
      title,
      content,
      minutes,
    })),
  };
}
export function adaptLesson(lesson: Lesson, student: Student): Lesson {
  return {
    ...lesson,
    id: uid(),
    sourceId: lesson.id,
    studentId: student.id,
    language: student.language,
    level: student.level,
    outcome: student.goal,
    blocks: lesson.blocks.map((b) => ({ ...b, id: uid() })),
    status: "Draft",
    archived: false,
    sharedVersion: undefined,
  };
}
