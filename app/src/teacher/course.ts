import type { Lesson } from "./model";

export const moduleTypes = [
  "Warm-up",
  "Vocabulary",
  "Grammar",
  "Listening",
  "Speaking",
  "Reflection",
  "Custom",
] as const;
export type ModuleType = (typeof moduleTypes)[number];
export const teachFormats = [
  "Flashcards",
  "Useful phrases",
  "Sentence construction",
  "Audio",
  "Video",
  "Lesson recap",
  "Image",
  "Transcript",
  "Text box",
  "Document",
] as const;
export const practiceFormats = [
  "Vocabulary recall",
  "Flashcards",
  "Matching pairs",
  "Word sorting",
  "Sentence construction",
  "Quiz",
  "Fill the gap",
  "Written response",
  "Spoken response",
  "Role-play",
  "Audio",
  "Video",
  "Image",
  "Text box",
  "Document",
] as const;
export type Format =
  | (typeof teachFormats)[number]
  | (typeof practiceFormats)[number];
export type Purpose = "Teach" | "Practise";
export type Word = {
  id: string;
  word: string;
  meaning: string;
  picture: string;
  pronunciation: string;
  assetId?: string;
  imageId?: string;
};
export type Part = { id: string; text: string; role: string; note: string };
export type Pair = { id: string; left: string; right: string };
export type Clip = {
  id: string;
  title: string;
  transcript: string;
  answer: string;
  assetId?: string;
  filename?: string;
};
export type CourseBlock = {
  id: string;
  purpose: Purpose;
  format: Format;
  title: string;
  instructions: string;
  text: string;
  translation: string;
  answer: string;
  alternatives: string;
  words: Word[];
  parts: Part[];
  pairs: Pair[];
  choices: string[];
  clips: Clip[];
  assetId?: string;
  filename?: string;
  picture: string;
};
export type CourseModule = {
  id: string;
  type: ModuleType;
  title: string;
  goal: string;
  minutes: number;
  blocks: CourseBlock[];
};
export type Course = {
  title: string;
  goal: string;
  language: string;
  level: string;
  modules: CourseModule[];
};
export type CourseTemplate = {
  id: string;
  name: string;
  level: string;
  content: Course;
  own?: boolean;
};
export type AppliedCourse = {
  content: Course;
  studentId: string;
  appliedAt: string;
};
export const partRoles = [
  "Subject",
  "Verb",
  "Object",
  "Direct object",
  "Indirect object",
  "Article",
  "Noun",
  "Pronoun",
  "Adjective",
  "Adverb",
  "Preposition",
  "Prepositional phrase",
  "Conjunction",
  "Auxiliary verb",
  "Modal verb",
  "Infinitive",
  "Participle",
  "Conjugation",
  "Negation",
  "Complement",
  "Relative clause",
  "Subordinate clause",
  "Main clause",
  "Conditional clause",
  "Time expression",
  "Custom",
];
export const id = () => crypto.randomUUID();
export const word = (): Word => ({
  id: id(),
  word: "un café",
  meaning: "a coffee",
  picture: "☕",
  pronunciation: "un café",
});
export const pair = (): Pair => ({
  id: id(),
  left: "un café",
  right: "a coffee",
});
export function createBlock(
  format: Format = "Text box",
  purpose: Purpose = "Teach",
): CourseBlock {
  return {
    id: id(),
    format,
    purpose,
    title: format,
    instructions:
      purpose === "Teach"
        ? "Explore the example, then make it your own."
        : "Take your time and try it yourself.",
    text:
      format === "Fill the gap"
        ? "Je ___ un café, s’il vous plaît."
        : "Je voudrais un café, s’il vous plaît.",
    translation: "I would like a coffee, please.",
    answer:
      format === "Quiz"
        ? "A coffee"
        : format === "Fill the gap"
          ? "voudrais"
          : "Je voudrais un café",
    alternatives: "",
    words: [
      word(),
      {
        ...word(),
        id: id(),
        word: "un thé",
        meaning: "a tea",
        picture: "🍵",
        pronunciation: "un thé",
      },
    ],
    parts: [
      { id: id(), text: "Je", role: "Subject", note: "I" },
      {
        id: id(),
        text: "voudrais",
        role: "Verb",
        note: "would like · vouloir, conditional",
      },
      { id: id(), text: "un café", role: "Object", note: "Swap for un thé" },
    ],
    pairs: [pair(), { id: id(), left: "un thé", right: "a tea" }],
    choices: ["A coffee", "A ticket", "A book"],
    clips: [
      {
        id: id(),
        title: "Ordering a coffee",
        transcript: "Qu’est-ce que vous voulez ?",
        answer: "Je voudrais un café, s’il vous plaît.",
      },
    ],
    picture: "☕",
  };
}
export function createModule(type: ModuleType = "Custom"): CourseModule {
  return {
    id: id(),
    type,
    title: type === "Custom" ? "Your module" : type,
    goal: "",
    minutes: 5,
    blocks: [],
  };
}
export const totalMinutes = (c: Course) =>
  c.modules.reduce(
    (n, m) => n + (Number.isFinite(m.minutes) ? m.minutes : 0),
    0,
  );
export const normalizeAnswer = (s: string) =>
  s.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase();
export const accepts = (input: string, canonical: string, alternatives = "") =>
  [canonical, ...alternatives.split("\n")]
    .filter((s) => s.trim())
    .some((s) => normalizeAnswer(input) === normalizeAnswer(s));
export const autoAssessed = (b: CourseBlock) =>
  b.purpose === "Practise" &&
  [
    "Vocabulary recall",
    "Flashcards",
    "Matching pairs",
    "Word sorting",
    "Sentence construction",
    "Quiz",
    "Fill the gap",
  ].includes(b.format);
export function answerKey(b: CourseBlock, index = 0): string {
  if (["Vocabulary recall", "Flashcards"].includes(b.format))
    return b.words[index]?.word || "";
  return b.answer;
}
export function blockIssues(b: CourseBlock): string[] {
  const issues: string[] = [];
  if (!b.title.trim()) issues.push("Give this block a title.");
  if (
    ["Flashcards", "Vocabulary recall", "Useful phrases"].includes(b.format) &&
    (!b.words.length ||
      b.words.some((w) => !w.word.trim() || !w.meaning.trim()))
  )
    issues.push("Add a word and English meaning for each card.");
  if (
    b.format === "Sentence construction" &&
    (!b.parts.length || b.parts.some((p) => !p.text.trim() || !p.role.trim()))
  )
    issues.push("Add text and a label for every sentence part.");
  if (
    ["Matching pairs", "Word sorting"].includes(b.format) &&
    (b.pairs.length < 2 ||
      b.pairs.some((p) => !p.left.trim() || !p.right.trim()) ||
      new Set(b.pairs.map((p) => normalizeAnswer(p.left))).size !==
        b.pairs.length ||
      (b.format === "Matching pairs" &&
        new Set(b.pairs.map((p) => normalizeAnswer(p.right))).size !==
          b.pairs.length))
  )
    issues.push("Add at least two complete, distinct pairs or sorting items.");
  if (
    autoAssessed(b) &&
    ![
      "Flashcards",
      "Vocabulary recall",
      "Matching pairs",
      "Word sorting",
    ].includes(b.format) &&
    !b.answer.trim()
  )
    issues.push("Enter the correct answer before students practise.");
  if (
    b.format === "Quiz" &&
    (b.choices.length < 2 ||
      b.choices.some((c) => !c.trim()) ||
      new Set(b.choices.map(normalizeAnswer)).size !== b.choices.length ||
      !b.choices.includes(b.answer))
  )
    issues.push("Add distinct quiz options and select the correct one.");
  if (
    b.format === "Sentence construction" &&
    b.purpose === "Practise" &&
    !accepts(b.parts.map((p) => p.text).join(" "), b.answer, b.alternatives)
  )
    issues.push(
      "The answer must match the sentence tiles in their intended order.",
    );
  if (
    ["Audio", "Video"].includes(b.format) &&
    (!b.clips.length ||
      b.clips.some(
        (c) => !c.title.trim() || (!c.assetId && !c.transcript.trim()),
      ))
  )
    issues.push("Add a file or sample transcript for each clip.");
  if (
    [
      "Image",
      "Text box",
      "Document",
      "Transcript",
      "Lesson recap",
      "Written response",
      "Spoken response",
      "Role-play",
      "Fill the gap",
    ].includes(b.format) &&
    !b.text.trim() &&
    !b.assetId
  )
    issues.push("Add the content or prompt for this block.");
  return issues;
}
export function courseIssues(c: Course): string[] {
  const issues = [];
  if (!c.title.trim()) issues.push("Add a lesson title.");
  if (!c.goal.trim()) issues.push("Add a lesson learning goal.");
  if (!c.modules.length) issues.push("Add at least one module.");
  for (const m of c.modules) {
    if (!m.title.trim() || !m.goal.trim())
      issues.push(`${m.title || "Module"}: add a title and learning goal.`);
    if (!Number.isFinite(m.minutes) || m.minutes <= 0 || m.minutes > 240)
      issues.push(`${m.title}: enter 1–240 minutes.`);
    if (!m.blocks.length) issues.push(`${m.title}: add a block.`);
    for (const b of m.blocks)
      issues.push(
        ...blockIssues(b).map((s) => `${m.title} / ${b.title}: ${s}`),
      );
  }
  return issues;
}
// Older lessons remain editable; retain every title, instruction and duration.
export function fromLesson(l: Lesson): Course {
  if (l.course) return l.course;
  return {
    title: l.title,
    goal: l.outcome,
    language: l.language,
    level: l.level,
    modules: l.blocks.map((b) => {
      const type: ModuleType = moduleTypes.includes(b.type as ModuleType)
        ? (b.type as ModuleType)
        : "Speaking";
      const m = createModule(type);
      return {
        ...m,
        id: b.id,
        title: b.title,
        goal: b.content,
        minutes: b.minutes,
        blocks: [
          {
            ...createBlock(
              type === "Speaking" ? "Role-play" : "Text box",
              type === "Speaking" ? "Practise" : "Teach",
            ),
            title: b.title,
            text: b.content,
            instructions: b.content,
          },
        ],
      };
    }),
  };
}
export function coursePatch(c: Course): Partial<Lesson> {
  return {
    course: c,
    title: c.title,
    outcome: c.goal,
    language: c.language,
    level: c.level,
    status: "Draft",
    blocks: c.modules.map((m) => ({
      id: m.id,
      type: m.type,
      title: m.title,
      content: m.blocks.map((b) => `${b.title}: ${b.text}`).join("\n"),
      minutes: m.minutes,
    })),
  };
}
export function cloneCourse(c: Course): Course {
  return {
    ...structuredClone(c),
    modules: c.modules.map((m) => ({
      ...structuredClone(m),
      id: id(),
      blocks: m.blocks.map((b) => ({ ...structuredClone(b), id: id() })),
    })),
  };
}
export type Move = { moduleId: string; blockId?: string };
// Immutable move, including cross-module moves; answers/media travel with the block.
export function moveOutline(
  c: Course,
  from: Move,
  to: Move,
  after = false,
): Course {
  const result = structuredClone(c),
    source = result.modules.find((m) => m.id === from.moduleId),
    target = result.modules.find((m) => m.id === to.moduleId);
  if (!source || !target) return c;
  if (!from.blockId) {
    if (source.id === target.id) return c;
    result.modules.splice(result.modules.indexOf(source), 1);
    result.modules.splice(
      result.modules.indexOf(target) + Number(after),
      0,
      source,
    );
  } else {
    if (from.blockId === to.blockId) return c;
    const block = source.blocks.find((b) => b.id === from.blockId);
    if (!block) return c;
    source.blocks.splice(source.blocks.indexOf(block), 1);
    const index = to.blockId
      ? target.blocks.findIndex((b) => b.id === to.blockId) + Number(after)
      : target.blocks.length;
    target.blocks.splice(Math.max(0, index), 0, block);
  }
  return result;
}
export function readyTemplates(): CourseTemplate[] {
  const modules = moduleTypes
    .slice(0, 6)
    .map((type) => ({
      ...createModule(type),
      goal: `Build confidence with ${type.toLowerCase()}.`,
    }));
  modules[0].blocks = [createBlock("Vocabulary recall", "Practise")];
  modules[1].blocks = [
    createBlock("Flashcards"),
    createBlock("Matching pairs", "Practise"),
  ];
  modules[2].blocks = [
    createBlock("Sentence construction"),
    createBlock("Sentence construction", "Practise"),
  ];
  modules[3].blocks = [
    createBlock("Audio"),
    {
      ...createBlock("Written response", "Practise"),
      text: "What does the customer order?",
    },
  ];
  modules[4].blocks = [
    {
      ...createBlock("Spoken response", "Practise"),
      text: "Order a drink and ask whether you can pay by card.",
    },
  ];
  modules[5].blocks = [
    {
      ...createBlock("Lesson recap"),
      text: "You can now order a drink politely. Try replacing café with thé in your next conversation.",
    },
  ];
  const beginner: Course = {
    title: "A conversation at the café",
    goal: "Order a drink politely and ask a follow-up question.",
    language: "French",
    level: "A1",
    modules,
  };
  const advanced = cloneCourse(beginner);
  advanced.title = "Build a persuasive argument";
  advanced.goal =
    "Support an opinion, acknowledge a counterargument and reach a nuanced conclusion.";
  advanced.level = "C1";
  advanced.modules.forEach((m) => {
    m.goal = `Develop a persuasive argument through ${m.type.toLowerCase()}.`;
    m.minutes = 8;
  });
  advanced.modules[0].blocks = [
    {
      ...createBlock("Written response", "Practise"),
      text: "Should city centres be car-free? Recall two arguments for each side.",
    },
  ];
  const vocab = [
    {
      ...word(),
      word: "néanmoins",
      meaning: "nevertheless",
      picture: "⚖️",
      pronunciation: "néanmoins",
    },
    {
      ...word(),
      word: "en revanche",
      meaning: "on the other hand",
      picture: "↔️",
      pronunciation: "en revanche",
    },
  ];
  advanced.modules[1].blocks = [
    { ...createBlock("Flashcards"), words: vocab },
    {
      ...createBlock("Vocabulary recall", "Practise"),
      words: structuredClone(vocab),
    },
  ];
  const parts = [
    {
      id: id(),
      text: "Bien que les voitures soient utiles,",
      role: "Subordinate clause",
      note: "Bien que + subjunctive acknowledges a concession.",
    },
    {
      id: id(),
      text: "les centres-villes devraient être piétons.",
      role: "Main clause",
      note: "Conditional expresses a proposal.",
    },
  ];
  advanced.modules[2].blocks = [
    {
      ...createBlock("Sentence construction"),
      parts,
      translation:
        "Although cars are useful, city centres should be pedestrianised.",
    },
  ];
  advanced.modules[3].blocks = [
    {
      ...createBlock("Document"),
      title: "Read two perspectives",
      text: "Les zones piétonnes peuvent réduire la pollution et encourager le commerce local. Néanmoins, les habitants à mobilité réduite et les livraisons ont besoin d’un accès adapté. Une politique efficace doit donc prévoir des exceptions, des transports accessibles et une évaluation régulière des effets.",
    },
    {
      ...createBlock("Written response", "Practise"),
      text: "Compare the two perspectives. Which evidence would help decide?",
    },
  ];
  advanced.modules[4].blocks = [
    {
      ...createBlock("Spoken response", "Practise"),
      text: "Give a two-minute argument. Include a concession and a practical compromise.",
    },
  ];
  advanced.modules[5].blocks = [
    {
      ...createBlock("Lesson recap"),
      text: "State a position, acknowledge a counterargument, and propose a qualified conclusion. Reuse néanmoins and en revanche.",
    },
  ];
  return [
    {
      id: "ready-a1",
      name: "Beginner · At the café",
      level: "A1",
      content: beginner,
    },
    {
      id: "ready-c1",
      name: "Advanced · Persuasive arguments",
      level: "C1",
      content: advanced,
    },
  ];
}
