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
  moduleDisplayTitle,
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
    const b = createBlock(format, "Practice");
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
    assert.equal(autoAssessed(createBlock(format, "Practice")), false);
  const quiz = createBlock("Quiz", "Practice");
  quiz.answer = "Not an option";
  assert.ok(blockIssues(quiz).some((x) => x.includes("quiz options")));
  const sentence = createBlock("Sentence construction", "Practice");
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
test("empty modules, invalid minutes, missing lesson goals and incomplete blocks cannot be used", () => {
  const c = readyTemplates()[0].content;
  c.modules.push(createModule("Custom"));
  assert.ok(courseIssues(c).some((s) => s.includes("add a block")));
  c.goal = "";
  assert.ok(courseIssues(c).some((s) => s.includes("lesson learning goal")));
  c.modules[0].minutes = NaN;
  assert.ok(courseIssues(c).some((s) => s.includes("1–240")));
  c.modules[0].blocks[0].words = [];
  assert.ok(courseIssues(c).some((s) => s.includes("English meaning")));
});
test("module title and goal are optional while type fallbacks and lesson/block requirements remain", () => {
  const c = readyTemplates()[0].content;
  for (const module of c.modules) { module.title = "  "; module.goal = ""; }
  assert.deepEqual(courseIssues(c), []);
  assert.equal(moduleDisplayTitle(c.modules[1]), "Vocabulary");
  assert.equal(moduleDisplayTitle({ type: "Custom", title: "" }), "Custom section");
  assert.equal(moduleDisplayTitle({ type: "Custom", title: "My section" }), "My section");
  assert.equal(coursePatch(c).blocks[1].title, "Vocabulary");
  assert.equal(c.modules[1].title, "  ");
  c.title = "";
  assert.ok(courseIssues(c).includes("Add a lesson title."));
  c.modules[1].type = "Unknown";
  assert.ok(courseIssues(c).some(issue => issue.includes("choose a module type")));
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

test("saved legacy practice purposes normalize without rewriting authored text or stored snapshots", async () => {
  const { readLibrary } = await import("../src/teacher/course-storage.ts");
  const content = readyTemplates()[0].content;
  content.title = "Practise at the café";
  content.goal = "Practise making a polite request.";
  content.modules[0].blocks[0].purpose = "Practise";
  content.modules[0].blocks[0].instructions = "Practise saying your order.";
  const publishedAt = "2026-11-05T00:00:00Z";
  const raw = JSON.stringify({
    version: 1,
    lessons: [{
      ...initialLessons()[0],
      course: content,
      savedEditor: content,
      publishedEditor: { content, studentId: "lea", appliedAt: publishedAt },
    }],
    templates: [{ id: "legacy-template", name: "Practise template", level: "A1", content, own: true }],
  });
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  let stored = raw;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => key === "mimo.lesson-library.v1" ? stored : null,
      setItem: (_key, value) => { stored = value; },
    },
  });
  try {
    const library = readLibrary();
    const lesson = library.lessons[0];
    for (const course of [lesson.course, lesson.savedEditor, lesson.publishedEditor.content, library.templates[0].content]) {
      assert.equal(course.modules[0].blocks[0].purpose, "Practice");
      assert.equal(course.title, "Practise at the café");
      assert.equal(course.goal, "Practise making a polite request.");
      assert.equal(course.modules[0].blocks[0].instructions, "Practise saying your order.");
      assert.equal(course.modules[0].id, content.modules[0].id);
    }
    assert.equal(lesson.publishedEditor.appliedAt, publishedAt);
    assert.equal(lesson.publishedEditor.studentId, "lea");
    assert.equal(library.templates[0].name, "Practise template");
    assert.equal(stored, raw);
  } finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  }
});

async function withLessonStorage(run) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const values = new Map();
  let writes = 0;
  let fail = false;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { writes++; if (fail) throw new Error("Storage full"); values.set(key, value); },
  } });
  try { await run({ values, writes: () => writes, fail: value => { fail = value; } }); }
  finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  }
}
function lessonUseFixture() {
  const course = readyTemplates()[0].content;
  const lesson = { ...initialLessons()[0], id: "working-lesson", ...coursePatch(course), notes: "Private teaching note", studentId: undefined, publishedEditor: undefined };
  return { lesson, course, templates: [] };
}

test("Save draft permits unfinished private content and preserves previous assignments and templates", async () => {
  const { readLibrary, writeDraft, writeLessonUse } = await import("../src/teacher/course-storage.ts");
  await withLessonStorage(async h => {
    const request = lessonUseFixture();
    const used = await writeLessonUse({ ...request, studentId: "lea", templateName: "Reusable café" });
    const assignmentBefore = structuredClone(used.assignment);
    const incomplete = { ...request.lesson, ...coursePatch({ ...request.course, title: "", goal: "", modules: [] }) };
    writeDraft(incomplete, []);
    const library = readLibrary();
    assert.equal(library.lessons.find(lesson => lesson.id === incomplete.id).title, "");
    assert.deepEqual(library.lessons.find(lesson => lesson.id === used.assignment.id), assignmentBefore);
    assert.equal(library.templates.length, 1);
    assert.equal(library.lessons.length, 2);
    assert.equal(library.lessons.find(lesson => lesson.id === incomplete.id).publishedEditor, undefined);
  });
});

test("Use lesson keeps unchecked options inactive and preserves independent assignment/template snapshots", async () => {
  const { readLibrary, writeLessonUse } = await import("../src/teacher/course-storage.ts");
  await withLessonStorage(async h => {
    const request = lessonUseFixture();
    await assert.rejects(writeLessonUse(request), /Choose at least one option/);
    assert.equal(h.writes(), 0);
    const assigned = await writeLessonUse({ ...request, studentId: "lea" });
    assert.equal(assigned.assignment.studentId, "lea");
    assert.equal(assigned.assignment.sourceId, request.lesson.id);
    assert.equal(assigned.assignment.notes, "");
    assert.equal(readLibrary().templates.length, 0);
    assert.equal(assigned.draft.publishedEditor, undefined);
    const before = structuredClone(assigned.assignment);
    request.course.modules[0].title = "";
    request.course.modules[0].goal = "";
    request.course.title = "Revised private draft";
    const templated = await writeLessonUse({ ...request, templateName: "  A custom name  " });
    assert.equal(templated.assignment, undefined);
    assert.equal(templated.templates[0].name, "A custom name");
    assert.deepEqual(readLibrary().lessons.find(lesson => lesson.id === before.id), before);
    request.course.title = "An unsaved later edit";
    templated.templates[0].content.modules[0].blocks[0].words[0].word = "Changed returned template";
    assert.equal(readLibrary().templates[0].content.title, "Revised private draft");
    assert.equal(readLibrary().lessons.find(lesson => lesson.id === before.id).publishedEditor.content.modules[0].blocks[0].words[0].word, "un café");
  });
});

test("combined Use lesson is one atomic write and failed submission retries create one assignment/template", async () => {
  const { readLibrary, writeLessonUse } = await import("../src/teacher/course-storage.ts");
  await withLessonStorage(async h => {
    const request = { ...lessonUseFixture(), studentId: "lea", templateName: "Café for later" };
    h.fail(true);
    await assert.rejects(writeLessonUse(request), /Storage full/);
    assert.equal(h.writes(), 1);
    assert.equal(h.values.size, 0);
    h.fail(false);
    const used = await writeLessonUse(request);
    assert.equal(h.writes(), 2);
    const library = readLibrary();
    assert.equal(library.lessons.length, 2);
    assert.equal(library.templates.length, 1);
    assert.equal(library.lessons.filter(lesson => lesson.publishedEditor?.studentId === "lea").length, 1);
    used.draft.course.title = "Changed returned draft";
    used.templates[0].content.title = "Changed returned template";
    assert.equal(used.assignment.publishedEditor.content.title, request.course.title);
    assert.equal(readLibrary().lessons.find(lesson => lesson.id === used.assignment.id).publishedEditor.content.title, request.course.title);
  });
});

test("duplicate assignment is blocked while a different student receives a separate immutable version", async () => {
  const { readLibrary, writeLessonUse, writeDraft, hasLessonAssignment, LessonUseError } = await import("../src/teacher/course-storage.ts");
  await withLessonStorage(async h => {
    const request = lessonUseFixture();
    const first = await writeLessonUse({ ...request, studentId: "lea" });
    const raw = h.values.get("mimo.lesson-library.v1");
    request.course.title = "New material";
    await assert.rejects(writeLessonUse({ ...request, studentId: "lea", templateName: "Must not be created" }), error => error instanceof LessonUseError && error.field === "student");
    assert.equal(h.values.get("mimo.lesson-library.v1"), raw);
    const second = await writeLessonUse({ ...request, studentId: "lucas" });
    assert.notEqual(second.assignment.id, first.assignment.id);
    assert.equal(second.assignment.publishedEditor.content.title, "New material");
    assert.equal(readLibrary().lessons.find(lesson => lesson.id === first.assignment.id).publishedEditor.content.title, first.assignment.publishedEditor.content.title);
    assert.equal(hasLessonAssignment(readLibrary().lessons, request.lesson.id, "lea"), true);
    const editedAssigned = { ...first.assignment, ...coursePatch(request.course), publishedEditor: { ...first.assignment.publishedEditor, content: request.course } };
    writeDraft(editedAssigned, []);
    assert.deepEqual(readLibrary().lessons.find(lesson => lesson.id === first.assignment.id).publishedEditor, first.assignment.publishedEditor);
  });
});

test("Use lesson validates selected fields and required content without treating optional module fields as blockers", async () => {
  const { writeLessonUse } = await import("../src/teacher/course-storage.ts");
  await withLessonStorage(async h => {
    const request = lessonUseFixture();
    await assert.rejects(writeLessonUse({ ...request, studentId: "" }), /Choose a student/);
    await assert.rejects(writeLessonUse({ ...request, studentId: "not-a-student" }), /Choose a student/);
    await assert.rejects(writeLessonUse({ ...request, templateName: "  " }), /Enter a template name/);
    request.course.modules.forEach(module => { module.title = ""; module.goal = ""; });
    await writeLessonUse({ ...request, templateName: "Optional module metadata" });
    request.course.modules[0].blocks[0].words[0].word = "";
    await assert.rejects(writeLessonUse({ ...request, templateName: "Invalid content" }), /Warm-up.*English meaning/);
    request.course.title = "";
    await assert.rejects(writeLessonUse({ ...request, studentId: "lea" }), /Add a lesson title/);
  });
});

test("corrupt or unreadable lesson storage cannot be silently replaced by draft/use writes", async () => {
  const { writeDraft, writeLessonUse, readLibrary } = await import("../src/teacher/course-storage.ts");
  await withLessonStorage(async h => {
    const request = lessonUseFixture();
    for (const raw of ["", "broken", "null", "[]", '{"version":1,"lessons":[null],"templates":[]}']) {
      h.values.set("mimo.lesson-library.v1", raw);
      assert.deepEqual(readLibrary().lessons, []);
      assert.throws(() => writeDraft(request.lesson, []));
      await assert.rejects(writeLessonUse({ ...request, studentId: "lea", templateName: "Café" }));
      assert.equal(h.values.get("mimo.lesson-library.v1"), raw);
    }
    assert.equal(h.writes(), 0);
  });
});
