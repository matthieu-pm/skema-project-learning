import { expect, test } from "@playwright/test";
import { expectSelectedChoice, selectChoice } from "./helpers/select";

test("desktop dropdowns support keyboard selection, selected state, Escape and pointer selection", async ({ page }) => {
  await page.goto("/?learner=1&view=web&flow=search");
  const language = page.getByRole("combobox", { name: "Language", exact: true });
  await expect(language).toHaveJSProperty("tagName", "BUTTON");
  await language.focus();
  await language.press("Space");
  const list = page.getByRole("listbox");
  await expect(list).toBeVisible();
  await expect(page.getByRole("option", { name: "All languages", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("f");
  await expect(page.getByRole("option", { name: "French", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expectSelectedChoice(language, "French");
  await expect(language).toBeFocused();
  await language.press("ArrowDown");
  await expect(list).toBeVisible();
  await expect(page.getByRole("option", { name: "French", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Escape");
  await expect(list).toHaveCount(0);
  await expect(language).toBeFocused();
  await expectSelectedChoice(language, "French");
  await selectChoice(page, language, "English");
  await expectSelectedChoice(language, "English");
  await expect(page.locator(".lw-teacher-card").first()).toContainText("English");
});

test("a dropdown inside Use lesson stays above the dialog and returns focus to its control", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?teacher=1&view=web&flow=editor&lesson=cafe");
  await page.getByRole("button", { name: "Use lesson", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Use lesson", exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("checkbox", { name: "Assign to a student", exact: true }).click();
  const student = dialog.getByRole("combobox", { name: "Student", exact: true });
  await student.click();
  const learner = page.getByRole("option", { name: "Léa Martin · French A2", exact: true });
  await expect(learner).toBeInViewport();
  await learner.click();
  await expect(dialog).toBeVisible();
  await expectSelectedChoice(student, "Léa Martin · French A2");
  await expect(student).toBeFocused();
  await student.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await expect(student).toBeFocused();
  await dialog.getByRole("button", { name: "Close dialog", exact: true }).click();
  await expect(dialog).toHaveCount(0);
});

test("matching-answer dropdowns support keyboard navigation inside lesson preview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?teacher=1&view=web&flow=editor&lesson=cafe");
  await page.getByRole("button", { name: "Preview lesson", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Preview lesson", exact: true });
  await dialog.getByRole("button", { name: "Next block", exact: true }).click();
  await dialog.getByRole("button", { name: "Next block", exact: true }).click();
  const answer = dialog.getByRole("combobox", { name: "un café", exact: true });
  await answer.focus();
  await answer.press("Space");
  await expect(page.getByRole("option", { name: "Choose a match", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "a tea", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expectSelectedChoice(answer, "a tea");
  await expect(answer).toBeFocused();
  await answer.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await expect(answer).toBeFocused();
});

test("an optional desktop dropdown can clear its value through Not set", async ({ page }) => {
  await page.goto("/?teacher=1&view=web&flow=profile");
  await page.getByRole("button", { name: "Edit teaching profile", exact: true }).click();
  const duration = page.getByRole("combobox", { name: "Lesson duration", exact: true });
  await selectChoice(page, duration, "45 minutes");
  await expectSelectedChoice(duration, "45 minutes");
  await selectChoice(page, duration, "Not set");
  await expectSelectedChoice(duration, "Not set");
  await page.getByRole("button", { name: "Review teaching profile", exact: true }).click();
  await expect(page.locator(".teacher-web .tw-content")).toContainText("Duration not set");
});

test("submitted matching answers cannot reopen a dropdown until editing is resumed", async ({ page }) => {
  await page.goto("/?teacher=1&view=web&flow=preview&lesson=cafe");
  const player = page.locator(".teacher-web .ce-student-preview");
  await player.getByRole("button", { name: "Next block", exact: true }).click();
  await player.getByRole("button", { name: "Next block", exact: true }).click();
  await expect(player.getByRole("heading", { name: "Matching pairs", exact: true })).toBeVisible();
  const coffee = player.getByRole("combobox", { name: "un café", exact: true });
  const tea = player.getByRole("combobox", { name: "un thé", exact: true });
  await selectChoice(page, coffee, "a coffee");
  await selectChoice(page, tea, "a tea");
  await player.getByRole("button", { name: "Submit answer", exact: true }).click();
  await expect(coffee).toBeDisabled();
  await expect(tea).toBeDisabled();
  // A real pointer attempt must also stay blocked, including through a disabled fieldset.
  const box = await coffee.boundingBox();
  if (!box) throw new Error("Submitted answer control is not visible");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expectSelectedChoice(coffee, "a coffee");
  await player.getByRole("button", { name: "Edit submitted answer", exact: true }).click();
  await selectChoice(page, coffee, "a tea");
  await expectSelectedChoice(coffee, "a tea");
});

for (const presentation of ["phone", "forced colors"] as const) {
  test(`${presentation} keeps native selection and applies the selected value`, async ({ page }) => {
    if (presentation === "forced colors") await page.emulateMedia({ forcedColors: "active" });
    await page.goto(`/?learner=1&view=${presentation === "phone" ? "mobile" : "web"}&flow=search`);
    const screen = presentation === "phone" ? page.getByTestId("flow-current") : page.locator(".learner-web");
    const language = screen.getByRole("combobox", { name: "Language", exact: true });
    await expect(language).toHaveJSProperty("tagName", "SELECT");
    await selectChoice(page, language, "French");
    await expectSelectedChoice(language, "French");
    const teachers = screen.locator(".lw-teacher-card");
    expect(await teachers.count()).toBeGreaterThan(0);
    for (const teacher of await teachers.all()) await expect(teacher.locator(".lw-teacher-identity")).toContainText("French");
    await expect(page.getByRole("listbox")).toHaveCount(0);
  });
}
