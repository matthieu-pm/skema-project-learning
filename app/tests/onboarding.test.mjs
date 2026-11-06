import test from "node:test";
import assert from "node:assert/strict";
import {
  initialAnswers,
  changeAccountMethod,
  sampleGoogleAccount,
  toggleLearningLanguage,
  identitySteps,
  needsGuardian,
  changeAge,
  verificationExit,
  routeFor,
  nextStep,
  validStep,
  stepIds,
  dateOfBirthValid,
  formatDateOfBirth,
} from "../src/onboarding.ts";
const answers = (patch) => ({ ...initialAnswers, ...patch });

test("learner route groups related decisions and keeps independent language levels and final summary", () => {
  const route = routeFor(
    answers({ role: "learner", age: "18 or older", format: "In person" }),
  );
  for (const step of [
    "account",
    "age",
    "verify",
    "language",
    "level",
    "learner-goal",
    "learner-preferences",
    "extras",
  ])
    assert.ok(route.includes(step), step);
  for (const retired of [
    "email",
    "topic",
    "personal-goal",
    "resource",
    "format",
    "city",
    "days",
    "time",
    "notifications",
    "widget",
    "benefits",
  ])
    assert.ok(!route.includes(retired), retired);
  assert.equal(new Set(route).size, route.length);
  assert.equal(route.at(-1), "learner-ready");
});
test("teacher setup reaches review in eight screens with profile, subjects and lesson details grouped", () => {
  const a = answers({ role: "teacher", format: "In person" }),
    route = routeFor(a);
  assert.deepEqual(route.slice(0, route.indexOf("teacher-review") + 1), [
    "welcome",
    "role",
    "account",
    "verify",
    "teacher-profile",
    "teacher-subjects",
    "teacher-lessons",
    "teacher-review",
  ]);
  for (const step of identitySteps) assert.ok(route.includes(step));
  assert.equal(new Set(route).size, route.length);
  assert.equal(route.at(-1), "verification-ready");
  assert.ok(!route.includes("age"));
  assert.ok(!route.includes("guardian"));
});
test("meeting preferences, duration and price can be deferred independently", () => {
  for (const format of ["Online", "In person", "Either", ""]) {
    assert.equal(
      validStep(
        "teacher-lessons",
        answers({ format, duration: "45 minutes", rate: "30" }),
      ),
      true,
    );
    assert.equal(validStep("learner-preferences", answers({ format })), true);
    assert.ok(!routeFor(answers({ role: "teacher", format })).includes("city"));
  }
  assert.equal(
    validStep("teacher-lessons", answers({ duration: "45 minutes" })),
    true,
  );
  assert.equal(validStep("teacher-lessons", answers({ rate: "30" })), true);
});
test("under-18 route collects guardian details before verification and checks a distinct email", () => {
  const a = answers({ role: "learner", age: "Under 18" });
  assert.equal(nextStep("age", a), "guardian");
  assert.equal(nextStep("guardian", a), "verify");
  assert.ok(
    !validStep(
      "guardian",
      answers({ email: "same@example.com", guardianEmail: "SAME@example.com" }),
    ),
  );
  assert.ok(
    validStep(
      "guardian",
      answers({
        email: "learner@example.com",
        guardianEmail: "parent@example.com",
      }),
    ),
  );
});
test("grouped required fields, email, code, price and identity checks reject missing or malformed values", () => {
  for (const step of [
    "role",
    "account",
    "age",
    "verify",
    "language",
    "level",
    "teacher-profile",
    "teacher-subjects",
    "teacher-review",
    "learner-goal",
    "identity-details",
    "document-details",
    "document",
    "selfie",
  ])
    assert.equal(validStep(step, initialAnswers), false, step);
  assert.equal(validStep("account", answers({ email: "bad@" })), false);
  assert.equal(
    validStep("account", answers({ email: "valid@example.com" })),
    true,
  );
  assert.equal(validStep("verify", answers({ code: "abcdef" })), false);
  assert.equal(validStep("verify", answers({ code: "481629" })), true);
  for (const rate of ["0", "-1", "NaN", "1001", "Infinity"])
    assert.equal(
      validStep("teacher-lessons", answers({ duration: "45 minutes", rate })),
      false,
    );
  assert.equal(
    validStep(
      "teacher-profile",
      answers({ name: "Maya", approach: "Practical conversation" }),
    ),
    true,
  );
  assert.equal(
    validStep(
      "teacher-subjects",
      answers({ teachingLanguages: ["French"], teachingLevels: [] }),
    ),
    false,
  );
  assert.equal(
    validStep(
      "teacher-subjects",
      answers({ teachingLanguages: ["French"], teachingLevels: ["A1"] }),
    ),
    true,
  );
  assert.equal(
    validStep(
      "learner-goal",
      answers({ topic: "At work", personalGoal: "Present my idea." }),
    ),
    true,
  );
});
test("all reachable routes have known unique screens and stop at the correct branch endpoint", () => {
  for (const role of ["learner", "teacher"])
    for (const age of ["18 or older", "Under 18"])
      for (const accountMethod of ["email", "google"])
        for (const identityMethod of ["document", "persona"]) {
          const a = answers({
              role,
              age,
              accountMethod,
              identityMethod,
              learningLanguages: ["French", "Spanish"],
            }),
            route = routeFor(a);
          route.forEach((step) => assert.ok(stepIds.includes(step), step));
          assert.equal(new Set(route).size, route.length);
          assert.equal(nextStep(route.at(-1), a), null);
          assert.equal(
            route.at(-1),
            role === "teacher" ? "verification-ready" : "learner-ready",
          );
        }
});
test("teachers provide birth date only in grouped identity details and never the learner age branch", () => {
  const teacher = answers({ role: "teacher", age: "Under 18" }),
    route = routeFor(teacher);
  assert.equal(nextStep("account", teacher), "verify");
  assert.ok(!route.includes("age"));
  assert.ok(!route.includes("guardian"));
  assert.equal(nextStep("identity-intro", teacher), "identity-details");
  assert.equal(nextStep("identity-details", teacher), "document-details");
  assert.equal(route.filter((s) => s === "identity-details").length, 1);
  assert.ok(
    routeFor(answers({ role: "learner" })).includes("identity-details"),
  );
});
test("birth date retains calendar, future-date and formatting validation within the grouped identity form", () => {
  const today = new Date(2026, 9, 1);
  for (const date of [
    "",
    "1/1/2000",
    "31/04/2000",
    "29/02/1900",
    "29/02/2001",
    "00/01/2000",
    "01/13/2000",
    "02/10/2026",
    "01/01/2027",
  ])
    assert.equal(dateOfBirthValid(date, today), false, date);
  for (const date of ["29/02/2000", "29/02/2024", "01/10/2026", "15/06/1995"])
    assert.equal(dateOfBirthValid(date, today), true, date);
  assert.equal(
    validStep(
      "identity-details",
      answers({ legalName: "Example Adult", dateOfBirth: "31/04/2000" }),
    ),
    false,
  );
  assert.equal(
    validStep(
      "identity-details",
      answers({ legalName: "Example Adult", dateOfBirth: "15/06/1995" }),
    ),
    true,
  );
  assert.equal(formatDateOfBirth("15061995"), "15/06/1995");
  assert.equal(formatDateOfBirth("15/06/199"), "15/06/199");
});
test("learner extras keep notification and widget choices without forced daily commitments", () => {
  const a = answers({ role: "learner" }),
    route = routeFor(a);
  for (const step of ["routine", "daily-goal", "commitment", "reminders"])
    assert.ok(!route.includes(step));
  assert.equal(nextStep("learner-goal", a), "learner-preferences");
  assert.equal(nextStep("learner-preferences", a), "extras");
  assert.equal(nextStep("extras", a), "identity-intro");
  assert.equal(validStep("extras", a), true);
  assert.equal(a.notifications, false);
  assert.equal(a.widget, false);
  assert.ok(!("dailyGoal" in initialAnswers));
});
test("guardian verification remains explicit, happens once and resumes learner setup", () => {
  for (const age of ["18 or older", "Under 18"]) {
    const a = answers({ role: "learner", age }),
      route = routeFor(a);
    for (const step of identitySteps)
      assert.equal(route.filter((s) => s === step).length, 1, step);
    assert.equal(
      nextStep("extras", a),
      age === "Under 18" ? "learner-ready" : "identity-intro",
    );
    assert.equal(route.includes("guardian-handoff"), age === "Under 18");
    assert.equal(needsGuardian(a), age === "Under 18");
    assert.equal(
      nextStep("selfie", a),
      age === "Under 18" ? "language" : "learner-ready",
    );
    assert.equal(
      nextStep("verify", a),
      age === "Under 18" ? "guardian-handoff" : "language",
    );
    if (age === "Under 18")
      assert.deepEqual(
        route.slice(route.indexOf("verify") + 1, route.indexOf("language")),
        ["guardian-handoff", ...identitySteps],
      );
    assert.equal(
      verificationExit(a),
      age === "Under 18" ? "language" : "learner-ready",
    );
  }
  assert.equal(
    needsGuardian(answers({ role: "teacher", age: "Under 18" })),
    false,
  );
});
test("changing learner age clears identity details and guardian handoff state", () => {
  const a = answers({
    age: "18 or older",
    legalName: "Example Adult",
    dateOfBirth: "15/06/1995",
    country: "France",
    documentType: "Passport",
    documentReady: true,
    selfieReady: true,
    identityPreviewComplete: true,
    guardianEmail: "parent@example.com",
    guardianReady: true,
  });
  assert.deepEqual(changeAge(a, a.age), { age: a.age });
  for (const age of ["Under 18", "18 or older"]) {
    const changed = {
      ...a,
      ...changeAge(
        { ...a, age: age === "Under 18" ? "18 or older" : "Under 18" },
        age,
      ),
    };
    for (const step of identitySteps.filter((s) => s !== "identity-intro"))
      assert.equal(validStep(step, changed), false, step);
    assert.equal(changed.identityPreviewComplete, false);
    assert.equal(changed.guardianReady, false);
    assert.equal(changed.guardianEmail, "");
  }
});
test("multiple learner languages retain separate level choices and clear deselected language levels", () => {
  let a = answers({ role: "learner" });
  a = { ...a, ...toggleLearningLanguage(a, "French") };
  a = { ...a, ...toggleLearningLanguage(a, "Spanish") };
  assert.deepEqual(a.learningLanguages, ["French", "Spanish"]);
  assert.equal(nextStep("language", a), "level-French");
  assert.equal(nextStep("level-French", a), "level-Spanish");
  assert.equal(nextStep("level-Spanish", a), "learner-goal");
  assert.equal(validStep("level-French", a), false);
  a = { ...a, learningLevels: { French: "A1", Spanish: "B2" } };
  assert.equal(validStep("level-French", a), true);
  assert.equal(validStep("level-Spanish", a), true);
  a = { ...a, ...toggleLearningLanguage(a, "French") };
  assert.deepEqual(a.learningLevels, { Spanish: "B2" });
  assert.equal(nextStep("language", a), "level-Spanish");
  a = { ...a, ...toggleLearningLanguage(a, "Spanish") };
  assert.equal(validStep("language", a), false);
});
test("Persona shortcut and document fallback return to the correct teacher, adult or guardian route", () => {
  for (const [role, age, end] of [
    ["teacher", "18 or older", "verification-ready"],
    ["learner", "18 or older", "learner-ready"],
    ["learner", "Under 18", "language"],
  ]) {
    const a = answers({ role, age, identityMethod: "persona" }),
      route = routeFor(a);
    assert.equal(nextStep("identity-intro", a), "persona-link");
    assert.equal(nextStep("persona-link", a), end);
    assert.equal(route.filter((s) => s === "persona-link").length, 1);
    for (const step of identitySteps.filter((s) => s !== "identity-intro"))
      assert.ok(!route.includes(step));
    const document = { ...a, identityMethod: "document" };
    assert.equal(nextStep("identity-intro", document), "identity-details");
    assert.ok(!routeFor(document).includes("persona-link"));
  }
});
test("email entry is integrated into account choice while Google retains its labeled sample confirmation", () => {
  for (const role of ["learner", "teacher"]) {
    const email = answers({ role, age: "18 or older" });
    assert.equal(nextStep("role", email), "account");
    assert.equal(
      nextStep("account", email),
      role === "teacher" ? "verify" : "age",
    );
    assert.ok(!routeFor(email).includes("email"));
    const google = {
      ...email,
      accountMethod: "google",
      ...sampleGoogleAccount,
    };
    assert.equal(nextStep("account", google), "google-connect");
    assert.equal(
      nextStep("google-connect", google),
      role === "teacher" ? "teacher-profile" : "age",
    );
    assert.ok(!routeFor(google).includes("verify"));
  }
});
test("Google minor account still collects guardian email and the explicit adult handoff", () => {
  const a = answers({
    role: "learner",
    age: "Under 18",
    accountMethod: "google",
    ...sampleGoogleAccount,
  });
  assert.equal(nextStep("age", a), "guardian");
  assert.equal(validStep("guardian", a), false);
  assert.equal(nextStep("guardian", a), "guardian-handoff");
  assert.equal(nextStep("guardian-handoff", a), "identity-intro");
  assert.equal(nextStep("selfie", a), "language");
  assert.equal(nextStep("extras", a), "learner-ready");
});
test("switching account method clears stale verification while preserving a same-method email draft", () => {
  const google = answers({
    role: "teacher",
    accountMethod: "google",
    ...sampleGoogleAccount,
    guardianEmail: "parent@example.com",
    guardianReady: true,
    identityPreviewComplete: true,
  });
  const email = { ...google, ...changeAccountMethod(google, "email") };
  assert.equal(email.role, "teacher");
  assert.equal(email.email, "");
  assert.equal(email.verified, false);
  assert.equal(email.guardianReady, false);
  assert.equal(email.guardianEmail, "");
  assert.equal(email.identityPreviewComplete, false);
  const draft = { ...email, email: "draft@example.com" };
  assert.equal(
    { ...draft, ...changeAccountMethod(draft, "email") }.email,
    "draft@example.com",
  );
  assert.equal({ ...draft, ...changeAccountMethod(draft, "google") }.email, "");
});
test("greeting-only stops stay removed from every active route", () => {
  for (const role of ["learner", "teacher"])
    for (const accountMethod of ["email", "google"])
      for (const age of ["18 or older", "Under 18"]) {
        const a = answers({ role, accountMethod, age }),
          route = routeFor(a);
        for (const retired of [
          "greeting",
          "setup-intro",
          "teacher-intro",
          "encouragement",
        ]) {
          assert.ok(!route.includes(retired));
          assert.ok(!stepIds.includes(retired));
        }
        assert.equal(nextStep("welcome", a), "role");
        assert.ok(route.includes("document"));
        assert.ok(route.includes("selfie"));
      }
});
test("teacher review cannot bypass missing required details after an edit or Back navigation", () => {
  const valid = answers({
    name: "Example Teacher",
    approach: "Practice through conversation",
    teachingLanguages: ["French"],
    teachingLevels: ["A1"],
    duration: "45 minutes",
    rate: "30",
  });
  assert.equal(validStep("teacher-review", valid), true);
  for (const patch of [
    { name: "" },
    { approach: "a" },
    { teachingLanguages: [] },
    { teachingLevels: [] },
    { rate: "0" },
  ])
    assert.equal(validStep("teacher-review", { ...valid, ...patch }), false);
});

test("teacher progress separates eight setup screens from the optional identity check", async () => {
  const { setupProgress } = await import("../src/onboarding.ts");
  const a = answers({ role: "teacher" });
  assert.equal(setupProgress(a, "account").total, 8);
  assert.equal(setupProgress(a, "teacher-review").percent, 100);
  assert.deepEqual(setupProgress(a, "identity-intro"), {
    index: 0,
    total: 5,
    percent: 0,
    optionalIdentity: true,
  });
  assert.equal(
    setupProgress({ ...a, identityMethod: "persona" }, "persona-link").total,
    2,
  );
  assert.equal(
    setupProgress(answers({ role: "learner" }), "learner-ready").percent,
    100,
  );
});

test("free lessons require explicit confirmation while unset pricing remains an optional draft", () => {
  assert.equal(validStep("teacher-lessons", initialAnswers), true);
  const free = answers({ duration: "45 minutes", rate: "0" });
  assert.equal(validStep("teacher-lessons", free), false);
  assert.equal(
    validStep("teacher-lessons", { ...free, freeConfirmed: true }),
    true,
  );
  assert.equal(
    validStep("teacher-lessons", answers({ rate: "-1", freeConfirmed: true })),
    false,
  );
});
