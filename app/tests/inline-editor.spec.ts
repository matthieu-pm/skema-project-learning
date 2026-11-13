import { expect, test as base } from "@playwright/test";

const test = base.extend<{ browserErrors: string[] }>({
  browserErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await use(errors);
    expect(errors).toEqual([]);
  }, { auto: true }],
});

const entry = (view = "web") => `/?teacher=1&view=${view}&flow=editor&lesson=cafe`;

test("canvas edits, grouped undo, preview and saved/applied versions stay consistent", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(entry());
  const canvas = page.locator(".ce-canvas");
  const title = canvas.getByRole("textbox", { name: "Lesson title", exact: true });
  await expect(title).toHaveValue("A conversation at the café");
  await title.fill("At the bakery");
  await title.pressSequentially(" today");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(title).toHaveValue("A conversation at the café");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(title).toHaveValue("At the bakery today");

  await canvas.getByLabel("Lesson learning goal", { exact: true }).fill("Order bread and ask a follow-up question.");
  await canvas.getByLabel("Language", { exact: true }).selectOption("French");
  await canvas.getByLabel("Level", { exact: true }).selectOption("A1");
  await expect(canvas.getByLabel("Language", { exact: true })).toBeVisible();
  const firstModule = canvas.locator(".ce-module").nth(0);
  await firstModule.getByLabel("Module title (optional)", { exact: true }).fill("A useful start");
  await firstModule.getByLabel("Estimated minutes", { exact: true }).fill("8");
  await expect(canvas.locator(".ce-lesson-metadata")).toContainText("33 min");

  const word = firstModule.getByLabel("Word or phrase 1", { exact: true });
  await word.fill("un pain");
  await firstModule.getByLabel("English meaning 1", { exact: true }).fill("a loaf of bread");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("button", { name: "Use lesson", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Assign to a student").check();
  await dialog.getByLabel("Student", { exact: true }).selectOption("lea");
  await dialog.getByLabel("Save as a lesson template").check();
  await dialog.getByRole("button", { name: "Assign and save template", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await word.fill("une baguette");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("button", { name: "View assigned version", exact: true }).click();
  await page.getByRole("dialog").getByRole("textbox").fill("un pain");
  await page.getByRole("dialog").getByRole("button", { name: "Submit answer", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Reveal answer", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("un pain");
  await expect(page.getByRole("dialog")).not.toContainText("une baguette");
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  // The live student preview beside the canvas follows the edited block.
  const preview = page.getByRole("region", { name: "Student preview" });
  await word.focus();
  await preview.getByRole("textbox").fill("une baguette");
  await preview.getByRole("button", { name: "Submit answer", exact: true }).click();
  await preview.getByRole("button", { name: "Reveal answer", exact: true }).click();
  await expect(preview).toContainText("une baguette");
  await page.reload();
  await expect(title).toHaveValue("At the bakery today");
  await expect(word).toHaveValue("une baguette");
  await page.screenshot({ path: "qa/inline-editor/desktop.png" });
});

test("editing other modules and adding a quiz keeps all content and answer keys inline", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(entry());
  const canvas = page.locator(".ce-canvas");
  const modules = canvas.locator(".ce-module");
  const pairs = modules.nth(1).locator(".ce-canvas-block").nth(1);
  await pairs.getByLabel("Matching answer 1", { exact: true }).fill("one coffee");
  await expect(pairs.getByLabel("Matching answer 1", { exact: true })).toHaveValue("one coffee");
  const sentence = modules.nth(2).locator(".ce-canvas-block").nth(1);
  await sentence.getByLabel("Sentence part 3", { exact: true }).fill("un thé");
  await expect(sentence.getByLabel("Correct answer", { exact: true })).toHaveValue("Je voudrais un thé");
  const audio = modules.nth(3).locator(".ce-canvas-block").nth(0);
  await audio.getByLabel("Transcript 1", { exact: true }).fill("Bonjour. Un café, s’il vous plaît.");
  await modules.nth(4).getByLabel("Student prompt", { exact: true }).fill("Order two drinks politely.");
  await expect(modules.nth(0).getByLabel("Word or phrase 1", { exact: true })).toHaveValue("un café");
  await modules.nth(4).getByRole("button", { name: "Add block", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Practice", exact: true }).click();
  await dialog.getByRole("button", { name: /Quiz/ }).click();
  const quiz = modules.nth(4).locator(".ce-canvas-block").last();
  await quiz.getByLabel("Question", { exact: true }).fill("Which phrase is polite?");
  await quiz.getByLabel("Option 1", { exact: true }).fill("S’il vous plaît");
  await quiz.getByLabel("Correct quiz answer", { exact: true }).selectOption("S’il vous plaît");
  await quiz.getByLabel("Option 1", { exact: true }).fill("Merci");
  await expect(quiz.getByLabel("Correct quiz answer", { exact: true })).toHaveValue("Merci");
  await quiz.getByLabel("Option 1", { exact: true }).fill("");
  await expect(quiz.locator(".ce-warning")).toBeVisible();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.reload();
  await expect(audio.getByLabel("Transcript 1", { exact: true })).toHaveValue("Bonjour. Un café, s’il vous plaît.");
  await expect(sentence.getByLabel("Correct answer", { exact: true })).toHaveValue("Je voudrais un thé");
  await expect(quiz.getByLabel("Option 1", { exact: true })).toHaveValue("");
});

for (const pixel of [false, true]) {
  test(`${pixel ? "Pixel" : "iPhone"} canvas editing keeps keyboard, undo and navigation usable`, async ({ page }) => {
    await page.goto(entry("mobile"));
    if (pixel) {
      await page.getByTestId("device-picker").click();
      await page.getByTestId("device-option-pixel-10").click();
    }
    const current = page.getByTestId("flow-current");
    const canvas = current.locator(".ce-canvas");
    const title = canvas.getByLabel("Lesson title", { exact: true });
    await title.fill("A mobile lesson");
    await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "true");
    await title.blur();
    await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
    const word = canvas.getByLabel("Word or phrase 1", { exact: true }).first();
    await word.fill("une baguette");
    await word.blur();
    await expect(current.locator('.ce-layout')).toHaveAttribute("data-mobile-panel", "Canvas");
    await current.getByLabel("Lesson tools").getByRole("button", { name: "Undo", exact: true }).click();
    await expect(word).toHaveValue("un café");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    const widths = await current.locator(".tw-content").evaluate(el => ({ client: el.clientWidth, scroll: el.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
    await page.screenshot({ path: `qa/inline-editor/${pixel ? "pixel" : "iphone"}.png` });
    // Edit lesson / Student preview switch at the same block; preview navigation stays above the action bar.
    await current.getByRole("tab", { name: "Student preview", exact: true }).click();
    await expect(current.getByRole("region", { name: "Student preview" })).toBeVisible();
    await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
    const clear = await page.evaluate(() => { const nav = document.querySelector(".ce-live-nav")!.getBoundingClientRect(), bar = document.querySelector(".ce-phone-actions")!.getBoundingClientRect(); return nav.bottom <= bar.top + 1; });
    expect(clear).toBe(true);
  });
}
