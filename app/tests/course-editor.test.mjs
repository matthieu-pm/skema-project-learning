import test from "node:test";
import assert from "node:assert/strict";
import {
  accepts,
  answerKey,
  autoAssessed,
  blockIssues,
  cloneCourse,
  courseIssues,
  coursePatch,
  createBlock,
  createModule,
  fromLesson,
  moveOutline,
  readyTemplates,
  totalMinutes,
} from "../src/teacher/course.ts";
import {
  adaptLesson,
  initialLessons,
  learnerMaterial,
  students,
} from "../src/teacher/model.ts";

test("beginner and advanced templates have valid independent modules and activities", () => {
  const templates = readyTemplates();
  assert.deepEqual(
    templates.map((t) => t.level),
    ["A1", "C1"],
  );
  for (const t of templates) {
    assert.deepEqual(courseIssues(t.content), []);
    assert.equal(t.content.modules.length, 6);
    assert.ok(totalMinutes(t.content) > 0);
  }
  const source = templates[0].content,
    copy = cloneCourse(source);
  assert.notEqual(copy.modules[0].id, source.modules[0].id);
  assert.notEqual(copy.modules[0].blocks[0].id, source.modules[0].blocks[0].id);
  copy.modules[0].blocks[0].words[0].word = "Changed";
  assert.equal(source.modules[0].blocks[0].words[0].word, "un café");
});
test("assessment ignores case and repeated spaces, preserving accents and punctuation", () => {
  assert.equal(accepts("  UN   CAFÉ ", "un café"), true);
  assert.equal(accepts("un cafe", "un café"), false);
  assert.equal(accepts("cafe\u0301", "café"), true);
  assert.equal(accepts("tea", "coffee", "a tea\ntea"), true);
  assert.equal(accepts("", "", "\n"), false);
  assert.equal(accepts("hello!", "hello"), false);
});
test("all seven assessed formats validate teacher keys; open responses stay teacher-reviewed", () => {
  for (const format of [
    "Vocabulary recall",
    "Flashcards",
    "Matching pairs",
    "Word sorting",
    "Sentence construction",
    "Quiz",
    "Fill the gap",
  ]) {
    const b = createBlock(format, "Practise");
    assert.equal(autoAssessed(b), true, format);
    assert.deepEqual(blockIssues(b), [], format);
    if (["Flashcards", "Vocabulary recall"].includes(format)) {
      assert.equal(answerKey(b, 1), "un thé");
      b.words[0].word = "";
    } else if (["Matching pairs", "Word sorting"].includes(format))
      b.pairs[0].right = "";
    else b.answer = "";
    assert.ok(blockIssues(b).length, format);
  }
  for (const format of [
    "Written response",
    "Spoken response",
    "Audio",
    "Video",
    "Image",
    "Text box",
    "Document",
    "Role-play",
  ])
    assert.equal(autoAssessed(createBlock(format, "Practise")), false);
  const quiz = createBlock("Quiz", "Practise");
  quiz.answer = "Not an option";
  assert.ok(blockIssues(quiz).some((x) => x.includes("quiz options")));
  const sentence = createBlock("Sentence construction", "Practise");
  sentence.answer = "A sentence the tiles cannot construct";
  assert.ok(blockIssues(sentence).some((x) => x.includes("sentence tiles")));
});
test("outline reorders modules and moves whole blocks across modules without changing content or keys", () => {
  const c = readyTemplates()[0].content,
    original = structuredClone(c);
  const source = c.modules[0],
    target = c.modules[1],
    b = source.blocks[0];
  const moved = moveOutline(
    c,
    { moduleId: source.id, blockId: b.id },
    { moduleId: target.id, blockId: target.blocks[0].id },
  );
  assert.equal(moved.modules[0].blocks.length, 0);
  assert.deepEqual(moved.modules[1].blocks[0], b);
  assert.deepEqual(c, original);
  const reordered = moveOutline(
    c,
    { moduleId: c.modules[5].id },
    { moduleId: c.modules[0].id },
  );
  assert.equal(reordered.modules[0].type, "Reflection");
  assert.equal(totalMinutes(reordered), totalMinutes(c));
  assert.equal(
    moveOutline(c, { moduleId: "missing" }, { moduleId: target.id }),
    c,
  );
});
test("empty modules, invalid minutes, missing goals and incomplete blocks cannot be applied", () => {
  const c = readyTemplates()[0].content;
  c.modules.push(createModule("Custom"));
  assert.ok(courseIssues(c).some((s) => s.includes("add a block")));
  assert.ok(courseIssues(c).some((s) => s.includes("learning goal")));
  c.modules[0].minutes = NaN;
  assert.ok(courseIssues(c).some((s) => s.includes("1–240")));
  c.modules[0].blocks[0].words = [];
  assert.ok(courseIssues(c).some((s) => s.includes("English meaning")));
});
test("legacy conversion preserves content; adaptation and learner snapshots exclude private notes", () => {
  const l = initialLessons()[0],
    c = fromLesson(l);
  assert.equal(c.modules.length, l.blocks.length);
  assert.equal(c.modules[0].blocks[0].text, l.blocks[0].content);
  assert.equal(
    totalMinutes(c),
    l.blocks.reduce((n, b) => n + b.minutes, 0),
  );
  const rich = { ...l, ...coursePatch(readyTemplates()[0].content) };
  const snapshot = learnerMaterial(rich),
    adapted = adaptLesson(rich, students[2]);
  assert.ok(!JSON.stringify(snapshot).includes(l.notes));
  assert.equal(adapted.course.goal, students[2].goal);
  adapted.course.modules[0].blocks[0].words[0].word = "Independent";
  assert.equal(rich.course.modules[0].blocks[0].words[0].word, "un café");
  rich.course.modules[0].blocks[0].words[0].word = "Later draft";
  assert.equal(snapshot.course.modules[0].blocks[0].words[0].word, "un café");
});

test("explicit saves persist one draft and keep applied snapshots and other lessons independent", async () => {
  const { writeDraft, restoreLessons, readLibrary } = await import(
    "../src/teacher/course-storage.ts"
  );
  const values = new Map();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k) => values.get(k) ?? null,
      setItem: (k, v) => values.set(k, v),
    },
  });
  const source = initialLessons()[0],
    content = readyTemplates()[0].content;
  const applied = {
    content: structuredClone(content),
    studentId: "lea",
    appliedAt: "2026-11-05T00:00:00Z",
  };
  const lesson = {
    ...source,
    ...coursePatch(content),
    savedEditor: structuredClone(content),
    publishedEditor: applied,
    savedAt: applied.appliedAt,
  };
  writeDraft(lesson, []);
  content.title = "A later working edit";
  const restored = restoreLessons(initialLessons()).find(
    (l) => l.id === source.id,
  );
  assert.notEqual(restored.course.title, content.title);
  assert.equal(restored.publishedEditor.content.title, applied.content.title);
  const second = { ...initialLessons()[2], title: "Saved second draft" };
  writeDraft(second, []);
  assert.equal(readLibrary().lessons.length, 2);
  assert.equal(
    readLibrary().lessons.find((l) => l.id === source.id).course.title,
    restored.course.title,
  );
  assert.equal(
    readLibrary().lessons.find((l) => l.id === second.id).title,
    second.title,
  );
  values.set("mimo.lesson-library.v1", "invalid JSON");
  assert.deepEqual(readLibrary().lessons, []);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: () => {
        throw new Error("Storage full");
      },
    },
  });
  assert.throws(() => writeDraft(lesson, []), /Storage full/);
  delete globalThis.localStorage;
});
