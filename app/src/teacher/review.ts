import {
  canReviewBlock,
  type BlockFeedback,
  type CompletedBlock,
  type FeedbackBook,
  type ModuleResult,
} from "./module-results.ts";
import {
  coursePatch,
  createBlock,
  createModule,
  type ModuleType,
  type CourseBlock,
  type Format,
} from "./course.ts";
import type { Lesson, Student } from "./model.ts";

export type Annotation = {
  id: string;
  kind: "writing" | "audio";
  quote: string;
  correction: string;
  note: string;
  at?: number;
};
export const ratings = [
  "Not reviewed",
  "Needs practice",
  "Meets task",
  "Strong evidence",
] as const;
export type Criterion = {
  id: string;
  label: string;
  rating: (typeof ratings)[number];
};
export type ReviewDetails = {
  strength?: string;
  improvement?: string;
  nextStep?: string;
  criteria?: Criterion[];
  annotations?: Annotation[];
  privateNote?: string;
  voiceId?: string;
  voiceName?: string;
};
export type SharedReview = Omit<ReviewDetails, "privateNote">;
export type SavedComment = {
  id: string;
  name: string;
  strength: string;
  improvement: string;
  nextStep: string;
};
export const commentStorageKey = "mimo-review-comments-v1";
export const defaultComments: SavedComment[] = [
  {
    id: "clear-message",
    name: "Clear message",
    strength: "Your meaning is clear and you answered the prompt.",
    improvement: "",
    nextStep: "Try the same task with a new example.",
  },
  {
    id: "polite-request",
    name: "Polite requests",
    strength: "You chose vocabulary that fits the situation.",
    improvement: "Use ‘je voudrais’ for a polite request.",
    nextStep: "Make two new polite requests using different items.",
  },
  {
    id: "speaking-pace",
    name: "Speaking pace",
    strength: "Your main idea is easy to follow.",
    improvement: "Pause between phrases so each idea is clear.",
    nextStep:
      "Record a new response and focus on one complete phrase at a time.",
  },
];
export function visibleReview(value: BlockFeedback): SharedReview {
  const { privateNote: _private, ...visible } = value.review || {};
  return structuredClone(visible);
}
export function feedbackText(value: BlockFeedback): string {
  const r = value.review || {};
  return [
    value.draft.trim(),
    r.strength?.trim() && `What went well: ${r.strength.trim()}`,
    r.improvement?.trim() && `What to improve: ${r.improvement.trim()}`,
    r.nextStep?.trim() && `What to try next: ${r.nextStep.trim()}`,
    ...(r.criteria || [])
      .filter((c) => c.rating !== "Not reviewed")
      .map((c) => `${c.label}: ${c.rating}`),
    ...(r.annotations || []).map(
      (a) =>
        `${a.kind === "audio" ? `At ${formatTime(a.at || 0)}` : `“${a.quote}”`}: ${[a.correction, a.note].filter(Boolean).join(" — ")}`,
    ),
    r.voiceId && "Voice feedback attached.",
  ]
    .filter(Boolean)
    .join("\n");
}
export function feedbackSignature(value: BlockFeedback): string {
  return JSON.stringify({
    text: feedbackText(value),
    voiceId: value.review?.voiceId || "",
  });
}
export function isPending(value?: BlockFeedback): boolean {
  if (!value || !feedbackText(value)) return false;
  return value.sharedSignature
    ? value.sharedSignature !== feedbackSignature(value)
    : feedbackText(value) !== value.shared;
}
export function reviewStatus(result: ModuleResult, book: FeedbackBook): string {
  const blocks = result.blocks.filter(canReviewBlock);
  const rows = book[result.id] || {};
  if (
    blocks.length &&
    blocks.every((b) => rows[b.id]?.shared && !isPending(rows[b.id]))
  )
    return "Feedback shared";
  return result.revision ? "Revision submitted" : "Awaiting review";
}
export function remainingReviews(
  result: ModuleResult,
  book: FeedbackBook,
): number {
  return result.blocks.filter(
    (b) =>
      canReviewBlock(b) &&
      (!book[result.id]?.[b.id]?.shared || isPending(book[result.id]?.[b.id])),
  ).length;
}
export function defaultCriteria(block: CompletedBlock): Criterion[] {
  const labels = block.recording
    ? ["Task completion", "Intelligibility", "Fluency", "Language accuracy"]
    : ["Task completion", "Clarity", "Language accuracy"];
  return labels.map((label, i) => ({
    id: `criterion-${i}`,
    label,
    rating: "Not reviewed",
  }));
}
export const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
export function validateAnnotation(
  annotation: Annotation,
  block: CompletedBlock,
): string {
  if (!annotation.correction.trim() && !annotation.note.trim())
    return "Add a correction or a comment before saving.";
  if (
    annotation.kind === "writing" &&
    (!annotation.quote.trim() || !block.response?.includes(annotation.quote))
  )
    return "Copy the words to review exactly as they appear in the student response.";
  if (
    annotation.kind === "audio" &&
    (!Number.isFinite(annotation.at) ||
      annotation.at! < 0 ||
      annotation.at! > (block.recording?.seconds ?? 0))
  )
    return "Choose a timestamp within the recording.";
  return "";
}
export type FollowUpFormat =
  | "Written response"
  | "Spoken response"
  | "Reuse activity";
export function reusePractice(block: CompletedBlock): CourseBlock {
  const original = block.type.split(" · ")[1];
  const format: Format = block.recording
    ? "Spoken response"
    : original === "Arrange words"
      ? "Sentence construction"
      : [
            "Vocabulary recall",
            "Matching pairs",
            "Fill the gap",
            "Quiz",
            "Written response",
          ].includes(original)
        ? (original as Format)
        : "Written response";
  const copy = createBlock(format, "Practise");
  copy.title = block.title;
  copy.text = block.prompt;
  copy.instructions =
    "Try this activity again. Review your teacher’s feedback first.";
  copy.answer = block.answer || "";
  if (format === "Vocabulary recall")
    copy.words = [
      {
        id: crypto.randomUUID(),
        word: block.answer || "",
        meaning: block.prompt.match(/[‘'](.+?)[’']/)?.[1] || block.prompt,
        pronunciation: block.answer || "",
        picture: "",
      },
    ];
  if (format === "Matching pairs")
    copy.pairs = (block.answer || "").split("\n").map((line) => {
      const [left, right] = line.split(" → ");
      return { id: crypto.randomUUID(), left, right };
    });
  if (format === "Sentence construction")
    copy.parts = (block.answer || "")
      .split(" ")
      .map((text) => ({
        id: crypto.randomUUID(),
        text,
        role: "Custom",
        note: "",
      }));
  if (format === "Quiz") {
    copy.choices = [...block.prompt.matchAll(/[A-Z]:\s*([^·]+)/g)].map((m) =>
      m[1].trim(),
    );
    copy.answer = (block.answer || "").split(" · ").at(-1) || "";
  }
  return copy;
}
export function followUpLesson(
  result: ModuleResult,
  block: CompletedBlock,
  student: Student,
  goal: string,
  prompt: string,
  format: FollowUpFormat,
  lessonId: string,
): Lesson {
  const module = createModule(result.type as ModuleType);
  const activity =
    format === "Reuse activity"
      ? reusePractice(block)
      : createBlock(format, "Practise");
  activity.title = `Try again · ${block.title}`;
  activity.instructions =
    "Try this follow-up activity. Your teacher will review your response.";
  activity.text = prompt.trim();
  if (format !== "Reuse activity") activity.answer = "";
  module.title = `Next practice · ${result.module}`;
  module.goal = goal.trim();
  module.blocks = [activity];
  const course = {
    title: `${student.name.split(" ")[0]}’s follow-up practice`,
    goal: goal.trim(),
    language: student.language,
    level: student.level,
    modules: [module],
  };
  return {
    ...coursePatch(course),
    id: lessonId,
    title: course.title,
    outcome: course.goal,
    language: course.language,
    level: course.level,
    blocks: coursePatch(course).blocks!,
    notes: "",
    studentId: student.id,
    status: "Draft",
    archived: false,
  };
}


export function blockReviewLabel(block: CompletedBlock, value?: BlockFeedback): string {
  if (!canReviewBlock(block)) return "Viewed";
  if (value?.shared) return isPending(value) ? "Edited draft" : "Feedback shared";
  return value && feedbackText(value) ? "Feedback draft" : "Unreviewed";
}

export function nextUnreviewedBlock(
  result: ModuleResult,
  rows: Record<string, BlockFeedback>,
  currentId: string,
): string | undefined {
  const current = result.blocks.findIndex((b) => b.id === currentId);
  for (let offset = 1; offset < result.blocks.length; offset++) {
    const block = result.blocks[(Math.max(current, 0) + offset) % result.blocks.length];
    if (blockReviewLabel(block, rows[block.id]) === "Unreviewed") return block.id;
  }
  return undefined;
}
