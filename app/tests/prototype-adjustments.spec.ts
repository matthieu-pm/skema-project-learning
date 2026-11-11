import { expect, test, type Locator, type Page } from "@playwright/test";
import { selectChoice } from "./helpers/select";
import type { CourseTemplate } from "../src/teacher/course";
import type { Lesson } from "../src/teacher/model";

type Presentation = "web" | "iphone" | "pixel-10";
type Library = { lessons: Lesson[]; templates: CourseTemplate[] };
const libraryKey = "mimo.lesson-library.v1";
const experienceText = "I have taught conversational French to adult learners for five years.";
const group = (scope: Locator, language: string) => scope.getByRole("group", { name: `Levels for ${language}`, exact: true });
const level = (scope: Locator, language: string, value: string) => group(scope, language).getByRole("checkbox", { name: value, exact: true });

async function device(page: Page, presentation: Presentation) {
  if (presentation === "pixel-10") {
    await page.getByTestId("device-picker").click();
    await page.getByTestId("device-option-pixel-10").click();
  }
}

function setup(page: Page, presentation: Presentation) {
  const mobile = presentation !== "web";
  const current = () => mobile ? page.getByTestId("flow-current") : page.getByTestId("web-onboarding-current");
  const action = (name: string) => (mobile ? page.getByTestId("flow-fixed-footer") : current()).getByRole("button", { name, exact: true });
  const step = async (name: string) => {
    await expect(current()).toHaveCount(1);
    await expect(current().locator(`.onboarding-content[data-step="${name}"]`)).toBeVisible();
  };
  const advance = async (name: string, label = "Continue") => { await action(label).click(); await step(name); };
  return { mobile, current, action, step, advance };
}

async function addLanguage(scope: Locator, language: string) {
  const search = scope.getByRole("combobox", { name: "Search teaching languages", exact: true });
  await search.fill(language);
  await search.press("Enter");
  await expect(group(scope, language)).toBeVisible();
  await search.press("Escape");
  await search.blur();
}

async function blur(page: Page, field: Locator, mobile: boolean) {
  await field.blur();
  if (mobile) await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
}

async function focusedAboveKeyboard(page: Page, field: Locator, clearNavigation = true) {
  await expect(field).toBeFocused();
  const keyboard = page.getByTestId("keyboard-dock");
  await expect(keyboard).toHaveAttribute("data-visible", "true");
  await expect.poll(async () => {
    const dock = await keyboard.boundingBox(), phone = await page.locator(".device-screen").boundingBox();
    return !!dock && !!phone && Math.abs(dock.y + dock.height - (phone.y + phone.height)) <= 1;
  }).toBe(true);
  await expect.poll(async () => {
    const rect = await field.boundingBox(), dock = await keyboard.boundingBox();
    const footer = clearNavigation ? await page.getByTestId("flow-fixed-footer").boundingBox() : null;
    return !!rect && !!dock && rect.y + rect.height <= Math.min(dock.y, footer?.y ?? dock.y) + 1;
  }).toBe(true);
}

async function readLibrary(page: Page): Promise<Library> {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{"lessons":[],"templates":[]}'), libraryKey);
}

async function openEditor(page: Page, presentation: Presentation = "web") {
  const mobile = presentation !== "web";
  await page.setViewportSize(mobile ? { width: 1100, height: 1100 } : { width: 1440, height: 1000 });
  await page.goto(`/?teacher=1&view=${mobile ? "mobile" : "web"}&flow=editor&lesson=cafe`);
  await device(page, presentation);
  const scope = mobile ? page.getByTestId("flow-current") : page.locator(".teacher-web .tw-content");
  await expect(scope.locator(".ce-editor")).toBeVisible();
  return scope;
}

async function openUse(page: Page) {
  await page.getByRole("button", { name: "Use lesson", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Use lesson", exact: true });
  await expect(dialog).toBeVisible();
  return dialog;
}

for (const presentation of ["web", "iphone", "pixel-10"] as const) {
  test(`${presentation} teacher setup transfers distinct language levels and optional experience into editable profile`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize(presentation === "web" ? { width: 1280, height: 800 } : { width: 1100, height: 1100 });
    await page.goto(`/?view=${presentation === "web" ? "web" : "mobile"}`);
    await device(page, presentation);
    const flow = setup(page, presentation);
    await expect(flow.current()).toContainText("Your lessons.");
    await expect(flow.current()).toContainText("Real connections.");
    await expect(flow.current()).toContainText("Create lessons you can edit and reuse.");
    await expect(flow.current()).toContainText("in-person or online meetups.");
    await expect(flow.action("Get started")).toBeInViewport();
    await expect(flow.action("I already have an account")).toBeInViewport();
    if (presentation === "web") {
      await flow.advance("role", "I already have an account");
      await page.getByRole("button", { name: "Go back", exact: true }).click();
      await flow.step("welcome");
    }
    await flow.advance("role", "Get started");
    await flow.current().getByRole("button", { name: /I want to teach/ }).click();
    await flow.advance("account");
    await flow.current().getByRole("button", { name: "Continue with Google", exact: true }).click();
    await flow.step("google-connect");
    await flow.advance("teacher-profile", "Continue with this account");
    const name = flow.current().getByRole("textbox", { name: "Display name", exact: true });
    await name.fill("Casey Martin");
    await blur(page, name, flow.mobile);
    const approach = flow.current().getByRole("textbox", { name: "Your approach, in a sentence", exact: true });
    await approach.fill("Practical conversations shaped around your goals.");
    await blur(page, approach, flow.mobile);
    const experience = () => flow.current().getByRole("textbox", { name: "Language teaching experience", exact: true });
    await expect(experience()).toHaveValue("");
    if (!flow.mobile) { await experience().fill(experienceText); await blur(page, experience(), false); }
    // Phone paths deliberately leave experience blank to verify it is optional.
    await flow.advance("teacher-subjects");
    await addLanguage(flow.current(), "French");
    await flow.action("Continue").click();
    await expect(group(flow.current(), "French")).toHaveAttribute("aria-invalid", "true");
    await expect(group(flow.current(), "French")).toBeFocused();
    await expect(group(flow.current(), "French").getByRole("alert")).toHaveText("Choose at least one level for French.");
    await level(flow.current(), "French", "A2").click();
    await addLanguage(flow.current(), "German");
    await flow.action("Continue").click();
    await expect(group(flow.current(), "German")).toBeFocused();
    await expect(level(flow.current(), "French", "A2")).toBeChecked();
    await level(flow.current(), "German", "C1").click();
    const search = flow.current().getByRole("combobox", { name: "Search teaching languages", exact: true });
    await search.fill("NoSuchLanguage");
    if (flow.mobile) await focusedAboveKeyboard(page, search);
    await expect(flow.current().getByRole("status")).toContainText("No languages found. Try another search.");
    await expect(search).toHaveValue("NoSuchLanguage");
    await expect(level(flow.current(), "French", "A2")).toBeChecked();
    await expect(level(flow.current(), "German", "C1")).toBeChecked();
    await search.press("Escape");
    await blur(page, search, flow.mobile);
    if (!flow.mobile) {
      await flow.current().getByRole("button", { name: "Remove French", exact: true }).click();
      await expect(group(flow.current(), "French")).toHaveCount(0);
      await expect(level(flow.current(), "German", "C1")).toBeChecked();
      await addLanguage(flow.current(), "French");
      await expect(level(flow.current(), "French", "A2")).not.toBeChecked();
      await level(flow.current(), "French", "A2").click();
    }
    await flow.advance("teacher-lessons");
    const later = flow.current().getByRole("button", { name: "Decide later", exact: true });
    await later.click();
    await expect(later).toHaveAttribute("aria-pressed", "true");
    await expect(later.locator("svg")).toBeVisible();
    await flow.current().getByRole("button", { name: "Online", exact: true }).click();
    await expect(later).toHaveAttribute("aria-pressed", "false");
    await later.click();
    await expect(flow.current().getByRole("button", { name: "Online", exact: true })).toHaveAttribute("aria-pressed", "false");
    await flow.current().getByRole("button", { name: "45 minutes", exact: true }).click();
    const price = flow.current().getByRole("spinbutton", { name: "Price in euros / 45 minutes (optional)", exact: true });
    await price.fill("30");
    await blur(page, price, flow.mobile);
    await flow.advance("teacher-review");
    const summary = flow.current().getByRole("region", { name: "Languages and levels", exact: true });
    for (const [language, value] of [["French", "A2"], ["German", "C1"]]) {
      await expect(summary.locator("dt").filter({ hasText: language }).locator("..").locator("dd")).toHaveText(value);
    }
    await flow.current().getByRole("button", { name: "Edit lesson details", exact: true }).click();
    await flow.step("teacher-lessons");
    await expect(flow.current().getByRole("button", { name: "Decide later", exact: true })).toHaveAttribute("aria-pressed", "true");
    await flow.advance("teacher-review", "Save and return");
    if (flow.mobile) {
      await flow.current().getByRole("button", { name: "Edit profile", exact: true }).click();
      await flow.step("teacher-profile");
      await experience().fill(experienceText);
      await focusedAboveKeyboard(page, experience());
      await blur(page, experience(), true);
      await flow.advance("teacher-review", "Save and return");
    }
    await expect(flow.current()).toContainText(experienceText);
    await flow.advance("identity-intro", "Continue to identity check");
    for (const text of ["Verify before accepting bookings", "Identity, not qualifications"]) {
      const statement = flow.current().getByText(text, { exact: true });
      await expect(statement).toBeVisible();
      expect(await statement.evaluate(element => !element.closest('button, a, [role="button"], .info-card') && !element.hasAttribute("tabindex"))).toBe(true);
    }
    await expect(flow.current().getByRole("button", { name: /^Link Persona ID/ })).toBeVisible();
    await page.getByRole("button", { name: "Go back", exact: true }).click();
    await flow.step("teacher-review");
    await flow.action("Finish verification later").click();
    await expect(page.locator(flow.mobile ? ".teacher-mobile" : ".teacher-web")).toBeVisible();
    if (flow.mobile) await page.getByTestId("flow-fixed-footer").getByRole("button", { name: "Profile", exact: true }).click();
    else {
      await page.getByRole("button", { name: "Teacher account menu", exact: true }).click();
      await page.getByRole("menuitem", { name: "Teaching profile", exact: true }).click();
    }
    const profile = () => flow.mobile ? page.getByTestId("flow-current") : page.locator(".teacher-web .tw-content");
    await expect(profile()).toContainText(experienceText);
    await profile().getByRole("button", { name: "Edit teaching profile", exact: true }).click();
    const profileExperience = profile().getByRole("textbox", { name: "Language teaching experience", exact: true });
    await expect(profileExperience).toHaveValue(experienceText);
    await expect(level(profile(), "French", "A2")).toBeChecked();
    await expect(level(profile(), "German", "C1")).toBeChecked();
    await profileExperience.fill("");
    if (flow.mobile) await focusedAboveKeyboard(page, profileExperience);
    await blur(page, profileExperience, flow.mobile);
    await level(profile(), "German", "C1").click();
    await profile().getByRole("button", { name: "Review teaching profile", exact: true }).click();
    await expect(group(profile(), "German")).toBeFocused();
    await expect(group(profile(), "German").getByRole("alert")).toHaveText("Choose at least one level for German.");
    await level(profile(), "German", "C1").click();
    await profile().getByRole("button", { name: "Review teaching profile", exact: true }).click();
    await profile().getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(profile().getByRole("heading", { name: "Language teaching experience", exact: true })).toHaveCount(0);
    await profile().getByRole("button", { name: "Edit teaching profile", exact: true }).click();
    await expect(profile().getByRole("textbox", { name: "Language teaching experience", exact: true })).toHaveValue("");
    await expect(profile().getByRole("textbox", { name: "Display name", exact: true })).toHaveValue("Casey Martin");
    await expect(profile().getByRole("combobox", { name: "Lesson duration", exact: true })).toContainText("45 minutes");
    await expect(profile().getByRole("spinbutton", { name: "Price per lesson in euros", exact: true })).toHaveValue("30");
    await expect(level(profile(), "French", "A2")).toBeChecked();
    await expect(level(profile(), "German", "C1")).toBeChecked();
    expect(await profile().evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  });
}

test("Save draft persists unfinished private content without assignments or templates", async ({ page }) => {
  const scope = await openEditor(page);
  const actions = await page.locator(".ce-editor-footer").getByRole("button").allTextContents();
  expect(actions.map(text => text.trim()).filter(text => ["Preview lesson", "Save draft", "Use lesson"].includes(text))).toEqual(["Preview lesson", "Save draft", "Use lesson"]);
  const canvas = scope.locator(".ce-canvas");
  const lesson = canvas.getByRole("group", { name: "Lesson details", exact: true });
  await lesson.getByRole("textbox", { name: "Lesson title", exact: true }).fill("");
  const module = canvas.locator(".ce-module").first().getByRole("group", { name: "Module properties", exact: true });
  await module.getByRole("textbox", { name: "Module title", exact: true }).fill("");
  await module.getByRole("textbox", { name: "Module learning goal", exact: true }).fill("");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.locator(".tw-notice")).toContainText("Draft saved");
  const saved = await readLibrary(page);
  const draft = saved.lessons.find(value => value.id === "cafe")!;
  expect(draft.savedEditor?.title).toBe("");
  expect(draft.savedEditor?.modules[0].title).toBe("");
  expect(draft.publishedEditor).toBeUndefined();
  expect(saved.lessons.filter(value => value.sourceId === "cafe")).toHaveLength(0);
  expect(saved.templates).toHaveLength(0);
  await page.reload();
  await expect(lesson.getByRole("textbox", { name: "Lesson title", exact: true })).toHaveValue("");
  await expect(module.getByRole("textbox", { name: "Module title", exact: true })).toHaveValue("");
  await expect(scope.locator(".ce-outline-title").first()).toContainText("Warm-up");
});

test("Use lesson separates choices, validates visible fields and cancels without changing the draft", async ({ page }) => {
  const scope = await openEditor(page);
  const title = scope.locator(".ce-canvas").getByRole("textbox", { name: "Lesson title", exact: true });
  await title.fill("A reusable café lesson");
  const before = await page.evaluate(key => localStorage.getItem(key), libraryKey);
  for (const cancel of ["Keep editing", "Close dialog", "Escape"]) {
    const dialog = await openUse(page);
    await expect(dialog.getByRole("checkbox", { name: "Assign to a student", exact: true })).not.toBeChecked();
    await expect(dialog.getByRole("checkbox", { name: "Save as a lesson template", exact: true })).not.toBeChecked();
    await expect(dialog.getByRole("button", { name: "Use lesson", exact: true })).toBeDisabled();
    await expect(dialog).toContainText("Choose at least one option to continue.");
    await expect(dialog).toContainText("Prototype only. Assignment and template creation are simulated; no student is notified.");
    expect(await page.evaluate(key => localStorage.getItem(key), libraryKey)).toBe(before);
    if (cancel === "Keep editing") await page.screenshot({ path: "qa/prototype-adjustments/use-lesson-default.png" });
    if (cancel === "Escape") await page.keyboard.press("Escape");
    else await dialog.getByRole("button", { name: cancel, exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Use lesson", exact: true })).toBeFocused();
    await expect(title).toHaveValue("A reusable café lesson");
    expect(await page.evaluate(key => localStorage.getItem(key), libraryKey)).toBe(before);
  }
  const dialog = await openUse(page);
  const assign = dialog.getByRole("checkbox", { name: "Assign to a student", exact: true });
  const template = dialog.getByRole("checkbox", { name: "Save as a lesson template", exact: true });
  await assign.click();
  await expect(dialog).toContainText("Future edits won't change this student's assigned version.");
  await dialog.getByRole("button", { name: "Assign lesson", exact: true }).click();
  const student = dialog.getByRole("combobox", { name: "Student", exact: true });
  await expect(student).toBeFocused();
  await expect(dialog.getByText("Choose a student.", { exact: true })).toBeVisible();
  await selectChoice(page, student, "Maya Kapoor · French B2");
  await template.click();
  const templateName = dialog.getByRole("textbox", { name: "Template name", exact: true });
  await expect(templateName).toHaveValue("A reusable café lesson");
  await templateName.fill("Teacher-edited reusable name");
  await page.screenshot({ path: "qa/prototype-adjustments/use-lesson-both-options.png" });
  await assign.click();
  await expect(dialog.getByRole("button", { name: "Save template", exact: true })).toBeEnabled();
  await expect(student).toHaveCount(0);
  await assign.click();
  await expect(templateName).toHaveValue("Teacher-edited reusable name");
  await template.click();
  await expect(dialog.getByRole("button", { name: "Assign lesson", exact: true })).toBeEnabled();
  await expect(templateName).toHaveCount(0);
  await template.click();
  await expect(templateName).toHaveValue("Teacher-edited reusable name");
  await templateName.fill("   ");
  await dialog.getByRole("button", { name: "Assign and save template", exact: true }).click();
  await expect(templateName).toBeFocused();
  await expect(dialog.getByText("Enter a template name.", { exact: true })).toBeVisible();
  await templateName.fill("Template without assignment");
  await assign.click();
  await dialog.getByRole("button", { name: "Save template", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".tw-notice")).toContainText(/simulat/i);
  const library = await readLibrary(page);
  expect(library.templates.map(value => value.name)).toEqual(["Template without assignment"]);
  expect(library.lessons.filter(value => value.sourceId === "cafe")).toHaveLength(0);
  expect(library.lessons.find(value => value.id === "cafe")?.publishedEditor).toBeUndefined();
});

test("Use lesson retries an atomic failure once and preserves assigned snapshots and duplicate guards", async ({ page }) => {
  test.setTimeout(60_000);
  const scope = await openEditor(page);
  const canvas = scope.locator(".ce-canvas");
  const firstModule = canvas.locator(".ce-module").first().getByRole("group", { name: "Module properties", exact: true });
  await firstModule.getByRole("textbox", { name: "Module title", exact: true }).fill("");
  await firstModule.getByRole("textbox", { name: "Module learning goal", exact: true }).fill("");
  await page.getByRole("button", { name: "Preview lesson", exact: true }).click();
  const preview = page.getByRole("dialog", { name: "Preview lesson", exact: true });
  await expect(preview.locator(".ce-student-heading > strong")).toHaveText("Warm-up");
  await preview.getByRole("button", { name: "Close dialog", exact: true }).click();
  const dialog = await openUse(page);
  await dialog.getByRole("checkbox", { name: "Assign to a student", exact: true }).click();
  await selectChoice(page, dialog.getByRole("combobox", { name: "Student", exact: true }), "Maya Kapoor · French B2");
  await dialog.getByRole("checkbox", { name: "Save as a lesson template", exact: true }).click();
  await dialog.getByRole("textbox", { name: "Template name", exact: true }).fill("Independent café template");
  const before = await page.evaluate(key => localStorage.getItem(key), libraryKey);
  await page.evaluate(key => {
    const original = Storage.prototype.setItem;
    (window as Window & { restoreAdjustmentStorage?: () => void }).restoreAdjustmentStorage = () => { Storage.prototype.setItem = original; };
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException("Storage full for acceptance check", "QuotaExceededError");
      return original.call(this, name, value);
    };
  }, libraryKey);
  await dialog.getByRole("button", { name: "Assign and save template", exact: true }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("alert")).toContainText(/could not|couldn.t|failed/i);
  await expect(dialog.getByRole("textbox", { name: "Template name", exact: true })).toHaveValue("Independent café template");
  await expect(dialog.getByRole("checkbox", { name: "Assign to a student", exact: true })).toBeChecked();
  await expect(dialog.getByRole("checkbox", { name: "Save as a lesson template", exact: true })).toBeChecked();
  expect(await page.evaluate(key => localStorage.getItem(key), libraryKey)).toBe(before);
  await page.evaluate(() => { (window as Window & { restoreAdjustmentStorage?: () => void }).restoreAdjustmentStorage?.(); });
  // Hold the persistence lock to exercise actual processing controls before the
  // single atomic write, rather than depend on a fast machine's event timing.
  await page.evaluate(async key => {
    await new Promise<void>(acquired => {
      void navigator.locks.request(`${key}.use`, () => {
        acquired();
        return new Promise<void>(release => { (window as Window & { releaseAdjustmentUse?: () => void }).releaseAdjustmentUse = release; });
      });
    });
  }, libraryKey);
  await dialog.getByRole("button", { name: "Assign and save template", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Using lesson…", exact: true })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Keep editing", exact: true })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Close dialog", exact: true })).toBeDisabled();
  await expect(dialog.getByRole("checkbox", { name: "Assign to a student", exact: true })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), libraryKey)).toBe(before);
  await page.evaluate(() => { (window as Window & { releaseAdjustmentUse?: () => void }).releaseAdjustmentUse?.(); });
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".tw-notice")).toContainText(/simulat/i);
  const assigned = await readLibrary(page);
  const assignment = assigned.lessons.find(value => value.sourceId === "cafe" && value.studentId === "maya")!;
  expect(assignment).toBeDefined();
  expect(assigned.lessons.filter(value => value.sourceId === "cafe" && value.studentId === "maya")).toHaveLength(1);
  expect(assigned.templates).toHaveLength(1);
  expect(assignment.publishedEditor?.content.modules[0].title).toBe("");
  expect(assignment.publishedEditor?.content.modules[0].goal).toBe("");
  const title = canvas.getByRole("textbox", { name: "Lesson title", exact: true });
  await title.fill("A later private revision");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  expect((await readLibrary(page)).lessons.find(value => value.id === assignment.id)).toEqual(assignment);
  const duplicate = await openUse(page);
  await duplicate.getByRole("checkbox", { name: "Assign to a student", exact: true }).click();
  await selectChoice(page, duplicate.getByRole("combobox", { name: "Student", exact: true }), "Maya Kapoor · French B2");
  const snapshot = await page.evaluate(key => localStorage.getItem(key), libraryKey);
  await duplicate.getByRole("button", { name: "Assign lesson", exact: true }).click();
  await expect(duplicate.getByRole("alert")).toContainText(/already|assigned version|duplicate/i);
  await expect(duplicate.getByRole("combobox", { name: "Student", exact: true })).toBeFocused();
  expect(await page.evaluate(key => localStorage.getItem(key), libraryKey)).toBe(snapshot);
  await selectChoice(page, duplicate.getByRole("combobox", { name: "Student", exact: true }), "Noah Rossi · English A2");
  await duplicate.getByRole("button", { name: "Assign lesson", exact: true }).click();
  await expect(duplicate).toHaveCount(0);
  const final = await readLibrary(page);
  expect(final.templates).toHaveLength(1);
  expect(final.lessons.filter(value => value.sourceId === "cafe" && value.studentId === "noah")).toHaveLength(1);
  expect(final.lessons.find(value => value.id === assignment.id)).toEqual(assignment);
});

for (const presentation of ["iphone", "pixel-10"] as const) {
  test(`Use lesson ${presentation} dialog keeps native choices, keyboard fields, actions and cancellation usable`, async ({ page }) => {
    test.setTimeout(60_000);
    await openEditor(page, presentation);
    const configure = async () => {
      const dialog = await openUse(page);
      await dialog.getByRole("checkbox", { name: "Assign to a student", exact: true }).click();
      const student = dialog.getByRole("combobox", { name: "Student", exact: true });
      await expect(student).toHaveJSProperty("tagName", "SELECT");
      await selectChoice(page, student, "Maya Kapoor · French B2");
      await dialog.getByRole("checkbox", { name: "Save as a lesson template", exact: true }).click();
      const name = dialog.getByRole("textbox", { name: "Template name", exact: true });
      await name.fill(`Reusable lesson from ${presentation}`);
      await focusedAboveKeyboard(page, name, false);
      return dialog;
    };
    let dialog = await configure();
    if (presentation === "iphone") await page.keyboard.press("Escape");
    else await dialog.getByRole("button", { name: "Close dialog", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
    await expect(page.getByRole("button", { name: "Use lesson", exact: true })).toBeFocused();
    expect((await readLibrary(page)).templates).toHaveLength(0);
    dialog = await configure();
    const primary = dialog.getByRole("button", { name: "Assign and save template", exact: true });
    await primary.scrollIntoViewIfNeeded();
    const button = (await primary.boundingBox())!, phone = (await page.locator(".device-screen").boundingBox())!;
    const keyboard = (await page.getByTestId("keyboard-dock").boundingBox())!;
    expect(button.x).toBeGreaterThanOrEqual(phone.x - 1);
    expect(button.x + button.width).toBeLessThanOrEqual(phone.x + phone.width + 1);
    expect(button.y + button.height).toBeLessThanOrEqual(keyboard.y + 1);
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    await primary.click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
    const library = await readLibrary(page);
    expect(library.templates.map(value => value.name)).toEqual([`Reusable lesson from ${presentation}`]);
    expect(library.lessons.filter(value => value.sourceId === "cafe" && value.studentId === "maya")).toHaveLength(1);
  });
}
