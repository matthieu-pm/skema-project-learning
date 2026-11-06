import {
  feedbackSignature,
  feedbackText,
  isPending,
  visibleReview,
  type ReviewDetails,
  type SharedReview,
} from "./review.ts";
// Immutable fictional submissions: editing a lesson must not rewrite submitted work.
export type CompletedBlock = {
  id: string;
  title: string;
  type: string;
  prompt: string;
  response?: string;
  answer?: string;
  correct?: boolean;
  recording?: { transcript: string; seconds: number; src?: string };
};
export function canReviewBlock(block: CompletedBlock): boolean {
  return (
    block.type.startsWith("Practise · ") &&
    (block.response !== undefined || block.recording !== undefined)
  );
}
export type ModuleResult = {
  id: string;
  studentId: string;
  lesson: string;
  module: string;
  type: string;
  completedAt: string;
  revision?: boolean;
  goal?: string;
  blocks: CompletedBlock[];
};
export const moduleResults: ModuleResult[] = [
  {
    goal: "Recall and match useful café vocabulary.",
    id: "lea-vocabulary-1",
    studentId: "lea",
    lesson: "A conversation at the café",
    module: "Words for your order",
    type: "Vocabulary",
    completedAt: "5 November 2026",
    blocks: [
      {
        id: "vocab-teach",
        title: "Café essentials",
        type: "Teach · Flashcards",
        prompt: "un café — a coffee\nun thé — a tea\nl’addition — the bill",
      },
      {
        id: "vocab-recall",
        title: "Remember the word",
        type: "Practise · Vocabulary recall",
        prompt: "How do you say ‘the bill’ in French?",
        response: "le addition",
        answer: "l’addition",
        correct: false,
      },
      {
        id: "vocab-pairs",
        title: "Match the café words",
        type: "Practise · Matching pairs",
        prompt: "Match each French word to its English meaning.",
        response:
          "un café → a coffee\nun thé → a tea\nà emporter → to take away",
        answer: "un café → a coffee\nun thé → a tea\nà emporter → to take away",
        correct: true,
      },
    ],
  },
  {
    goal: "Construct a polite request using je voudrais.",
    id: "lea-grammar-1",
    studentId: "lea",
    lesson: "A conversation at the café",
    module: "Build a polite request",
    type: "Grammar",
    completedAt: "5 November 2026",
    blocks: [
      {
        id: "grammar-teach",
        title: "A structure you can reuse",
        type: "Teach · Sentence construction",
        prompt:
          "Je [subject] + voudrais [conditional verb] + un café [noun phrase] + s’il vous plaît [polite expression].\nI would like a coffee, please.",
      },
      {
        id: "grammar-order",
        title: "Put the request in order",
        type: "Practise · Arrange words",
        prompt: "Arrange: un thé / voudrais / Je / s’il vous plaît",
        response: "Je voudrais un thé s’il vous plaît",
        answer: "Je voudrais un thé s’il vous plaît",
        correct: true,
      },
      {
        id: "grammar-gap",
        title: "Complete the request",
        type: "Practise · Fill the gap",
        prompt: "Je ___ un café, s’il vous plaît.",
        response: "veux",
        answer: "voudrais",
        correct: false,
      },
    ],
  },
  {
    goal: "Order a drink and ask a relevant follow-up question.",
    id: "lea-speaking-1",
    studentId: "lea",
    lesson: "A conversation at the café",
    module: "Your turn to order",
    type: "Speaking",
    completedAt: "5 November 2026",
    blocks: [
      {
        id: "speaking-recording",
        title: "Ask the barista",
        type: "Practise · Spoken response",
        prompt: "Order a drink and ask what the barista recommends.",
        recording: {
          transcript:
            "Bonjour ! Je voudrais un café, s’il vous plaît. Vous conseillez quoi comme gâteau ?",
          seconds: 6.07,
          src: "/assets/review/lea-speaking.wav",
        },
      },
      {
        id: "speaking-written",
        title: "Try another situation",
        type: "Practise · Written response",
        prompt: "Write a polite request for the bill.",
        response: "Est-ce que je peux avoir l’addition, s’il vous plaît ?",
      },
    ],
  },
  {
    goal: "Identify the destination and departure time in a short conversation.",
    id: "lucas-listening-1",
    studentId: "lucas",
    lesson: "Listen like a local",
    module: "Catch the meaning",
    type: "Listening",
    completedAt: "5 November 2026",
    blocks: [
      {
        id: "listening-audio",
        title: "At the station",
        type: "Teach · Audio listening",
        prompt:
          "Dialogue transcript: ‘Where are you headed?’ ‘I’m on my way to the station. The train leaves at quarter past three.’",
      },
      {
        id: "listening-quiz",
        title: "Catch the departure time",
        type: "Practise · Quiz",
        prompt: "When does the train leave? A: 3:15 · B: 3:30 · C: 3:45",
        response: "A · 3:15",
        answer: "A · 3:15",
        correct: true,
      },
      {
        id: "listening-written",
        title: "Explain what you heard",
        type: "Practise · Written response",
        prompt: "Where is the speaker going, and why?",
        response:
          "The speaker is going to the station to catch a train at 3:15.",
      },
    ],
  },
  {
    revision: true,
    goal: "Present an opinion supported by a reason and an example.",
    id: "maya-speaking-1",
    studentId: "maya",
    lesson: "An idea worth sharing",
    module: "One idea, clearly",
    type: "Speaking",
    completedAt: "5 November 2026",
    blocks: [
      {
        id: "meeting-spoken",
        title: "Present your idea",
        type: "Practise · Spoken response",
        prompt: "Présentez une idée avec : à mon avis, parce que, par exemple.",
        recording: {
          transcript:
            "À mon avis, nous devrions proposer des horaires flexibles, parce que cela aide l’équipe. Par exemple, chacun pourrait commencer entre huit et dix heures.",
          seconds: 10.18,
          src: "/assets/review/maya-speaking.wav",
        },
      },
      {
        id: "meeting-reflection",
        title: "Reflect on your response",
        type: "Practise · Written response",
        prompt: "What would you improve next time?",
        response:
          "I want to pause less between my reason and my example, and use a clearer closing sentence.",
      },
    ],
  },
];
export type BlockFeedback = {
  draft: string;
  shared?: string;
  sharedAt?: string;
  review?: ReviewDetails;
  sharedReview?: SharedReview;
  sharedSignature?: string;
};
export type FeedbackBook = Record<string, Record<string, BlockFeedback>>;
export const feedbackStorageKey = "mimo-module-feedback-v1";
export function readFeedback(storage: Pick<Storage, "getItem">): FeedbackBook {
  const raw = storage.getItem(feedbackStorageKey);
  if (!raw) return {};
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("Invalid feedback");
  for (const rows of Object.values(data)) {
    if (!rows || typeof rows !== "object" || Array.isArray(rows))
      throw new Error("Invalid feedback");
    for (const value of Object.values(rows)) {
      if (
        !value ||
        typeof value !== "object" ||
        !("draft" in value) ||
        typeof value.draft !== "string" ||
        ("shared" in value &&
          value.shared !== undefined &&
          typeof value.shared !== "string") ||
        ("sharedAt" in value &&
          value.sharedAt !== undefined &&
          typeof value.sharedAt !== "string")
      )
        throw new Error("Invalid feedback");
    }
  }
  for (const rows of Object.values(data as FeedbackBook))
    for (const value of Object.values(rows)) {
      const r = value.review;
      if (r !== undefined) {
        if (!r || typeof r !== "object" || Array.isArray(r))
          throw new Error("Invalid review");
        for (const field of [
          "strength",
          "improvement",
          "nextStep",
          "privateNote",
          "voiceId",
          "voiceName",
        ] as const)
          if (r[field] !== undefined && typeof r[field] !== "string")
            throw new Error("Invalid review");
        if (
          r.criteria !== undefined &&
          (!Array.isArray(r.criteria) ||
            r.criteria.some(
              (c) =>
                !c ||
                typeof c.id !== "string" ||
                typeof c.label !== "string" ||
                ![
                  "Not reviewed",
                  "Needs practice",
                  "Meets task",
                  "Strong evidence",
                ].includes(c.rating),
            ))
        )
          throw new Error("Invalid rubric");
        if (
          r.annotations !== undefined &&
          (!Array.isArray(r.annotations) ||
            r.annotations.some(
              (a) =>
                !a ||
                typeof a.id !== "string" ||
                !["writing", "audio"].includes(a.kind) ||
                typeof a.quote !== "string" ||
                typeof a.correction !== "string" ||
                typeof a.note !== "string" ||
                (a.at !== undefined && !Number.isFinite(a.at)),
            ))
        )
          throw new Error("Invalid annotation");
      }
    }
  return data as FeedbackBook;
}
export function shareModuleFeedback(
  result: ModuleResult,
  book: FeedbackBook,
  now: string,
): FeedbackBook {
  const rows = { ...book[result.id] };
  for (const block of result.blocks) {
    const value = rows[block.id];
    if (canReviewBlock(block) && value && isPending(value)) {
      rows[block.id] = {
        ...value,
        shared: feedbackText(value),
        sharedReview: visibleReview(value),
        sharedSignature: feedbackSignature(value),
        sharedAt: now,
      };
    }
  }
  return { ...book, [result.id]: rows };
}
