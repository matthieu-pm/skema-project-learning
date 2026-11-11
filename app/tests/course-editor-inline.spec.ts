import { expect, test, type Locator, type Page } from "@playwright/test";

async function openEditor(page: Page, mobile = false) {
  if (!mobile) await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`/?teacher=1&view=${mobile ? "mobile" : "web"}&flow=editor&lesson=cafe`);
  const screen = mobile ? page.getByTestId("flow-current") : page.locator(".teacher-web");
  const editor = screen.locator(".ce-editor");
  await expect(editor).toBeVisible();
  return { screen, editor, canvas: editor.locator(".ce-canvas"), properties: editor.locator(".ce-properties") };
}

const details = (scope: Locator, name: "Lesson details" | "Module properties" | "Block properties") =>
  scope.getByRole("group", { name, exact: true });

test("canvas edits update the intended module and block and stay in sync with Properties", async ({ page }) => {
  const { editor, canvas, properties } = await openEditor(page);
  const modules = canvas.locator(".ce-module");
  const outline = editor.locator(".ce-outline-group");
  const firstModuleFields = details(modules.nth(0), "Module properties");
  const firstBlockFields = details(modules.nth(0), "Block properties").first();
  const firstTitle = await firstModuleFields.getByRole("textbox", { name: "Module title", exact: true }).inputValue();
  const firstBlockTitle = await firstBlockFields.getByRole("textbox", { name: "Block title", exact: true }).inputValue();
  await expect(canvas.getByRole("button", { name: "Edit lesson details", exact: true })).toHaveCount(0);
  await expect(canvas.getByRole("button", { name: "Done editing", exact: true })).toHaveCount(0);

  // Canvas controls are ready immediately, including for a nonselected module.
  const moduleFields = details(modules.nth(1), "Module properties");
  await outline.nth(0).locator(".ce-outline-title").first().click();
  await expect(properties.getByRole("textbox", { name: "Module title", exact: true })).toHaveValue(firstTitle);
  await moduleFields.getByRole("textbox", { name: "Module title", exact: true }).fill("Ordering at the café");
  await moduleFields.getByRole("spinbutton", { name: "Estimated minutes", exact: true }).fill("12");
  await expect(firstModuleFields.getByRole("textbox", { name: "Module title", exact: true })).toHaveValue(firstTitle);
  await expect(moduleFields.getByRole("textbox", { name: "Module title", exact: true })).toHaveValue("Ordering at the café");
  await expect(details(canvas, "Lesson details")).toContainText("37 min");

  await outline.nth(1).locator(".ce-outline-title").first().click();
  await expect(properties.getByRole("textbox", { name: "Module title", exact: true })).toHaveValue("Ordering at the café");
  await expect(properties.getByRole("spinbutton", { name: "Estimated minutes", exact: true })).toHaveValue("12");

  // Direct block edits keep their target when the sidebar selects another module.
  const blockFields = details(modules.nth(1), "Block properties").first();
  await outline.nth(0).locator(".ce-outline-title").first().click();
  await expect(properties.getByRole("textbox", { name: "Module title", exact: true })).toHaveValue(firstTitle);
  await blockFields.getByRole("textbox", { name: "Block title", exact: true }).fill("Choose your drink");
  await blockFields.getByRole("textbox", { name: "Student instructions", exact: true }).fill("Say what you would like to order.");
  await blockFields.getByRole("textbox", { name: "Word or phrase 1", exact: true }).fill("un cappuccino");
  await expect(firstBlockFields.getByRole("textbox", { name: "Block title", exact: true })).toHaveValue(firstBlockTitle);
  await expect(blockFields.getByRole("textbox", { name: "Block title", exact: true })).toHaveValue("Choose your drink");
  await expect(blockFields.getByRole("textbox", { name: "Word or phrase 1", exact: true })).toHaveValue("un cappuccino");

  await outline.nth(1).locator(".ce-outline-block .ce-outline-title").first().click();
  await expect(properties.getByRole("textbox", { name: "Block title", exact: true })).toHaveValue("Choose your drink");
  await expect(properties.getByRole("textbox", { name: "Student instructions", exact: true })).toHaveValue("Say what you would like to order.");
  await expect(properties.getByRole("textbox", { name: "Word or phrase 1", exact: true })).toHaveValue("un cappuccino");
  await properties.getByRole("textbox", { name: "Block title", exact: true }).fill("A drink for you");
  await expect(blockFields.getByRole("textbox", { name: "Block title", exact: true })).toHaveValue("A drink for you");
  await expect(outline.nth(1).locator(".ce-outline-block").first()).toContainText("A drink for you");
});

test("direct lesson changes support Undo and Redo and persist only after Save changes", async ({ page }) => {
  const { editor, canvas, properties } = await openEditor(page);
  const fields = details(canvas, "Lesson details");
  const title = fields.getByRole("textbox", { name: "Lesson title", exact: true });
  const originalTitle = await title.inputValue();
  const newTitle = "A useful café conversation";
  await title.fill(newTitle);
  await expect(properties.getByRole("textbox", { name: "Lesson title", exact: true })).toHaveValue(newTitle);
  await editor.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(title).toHaveValue(originalTitle);
  await expect(properties.getByRole("textbox", { name: "Lesson title", exact: true })).toHaveValue(originalTitle);
  await editor.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(title).toHaveValue(newTitle);
  page.once("dialog", dialog => dialog.accept());
  await page.reload();
  await expect(title).toHaveValue(originalTitle);
  await title.fill(newTitle);
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(canvas.locator(".ce-view-status")).toContainText("Saved");
  await page.reload();
  const restored = page.locator(".teacher-web .ce-canvas");
  await expect(details(restored, "Lesson details").getByRole("textbox", { name: "Lesson title", exact: true })).toHaveValue(newTitle);
});

test("phone direct editing keeps keyboard behavior and shares values with the Properties panel", async ({ page }) => {
  const { editor, canvas, properties } = await openEditor(page, true);
  const fields = details(canvas, "Lesson details");
  const title = fields.getByRole("textbox", { name: "Lesson title", exact: true });
  await title.fill("A conversation on the go");
  await expect(title).toBeFocused();
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "true");
  await expect.poll(async () => {
    const field = await title.boundingBox();
    const keyboard = await page.getByTestId("keyboard-dock").boundingBox();
    return !!field && !!keyboard && field.y + field.height <= keyboard.y + 1;
  }).toBe(true);
  await title.blur();
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
  const areas = editor.getByRole("navigation", { name: "Editor areas", exact: true });
  await areas.getByRole("button", { name: "Properties", exact: true }).click();
  await expect(properties.getByRole("textbox", { name: "Lesson title", exact: true })).toHaveValue("A conversation on the go");
  await areas.getByRole("button", { name: "Canvas", exact: true }).click();
  await expect(title).toHaveValue("A conversation on the go");
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
});

test("a new lesson presents a centered empty outline without the removed helper paragraphs", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?teacher=1&view=web&flow=lessons");
  await page.getByRole("button", { name: "New lesson", exact: true }).click();
  const editor = page.locator(".teacher-web .ce-editor");
  const empty = editor.getByText("Add a module to start building your lesson.", { exact: true });
  await expect(empty).toBeVisible();
  await expect(editor).not.toContainText("Choose a learning focus. Add any teaching or practice blocks.");
  await expect(editor).not.toContainText("Drag the grip to reorder. More actions offers the same controls.");
  await expect(empty).toHaveCSS("text-align", "center");
  const emptyHeight = await empty.evaluate(element => element.getBoundingClientRect().height);
  expect(emptyHeight).toBeGreaterThanOrEqual(120);
  await editor.getByRole("button", { name: "Warm-up", exact: true }).click();
  await expect(empty).toHaveCount(0);
  await expect(details(editor.locator(".ce-canvas .ce-module").first(), "Module properties")).toBeVisible();
});
