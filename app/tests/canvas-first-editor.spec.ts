import { expect, test, type Page } from "@playwright/test";

const editor = "/?teacher=1&view=web&flow=editor&lesson=cafe";
const tools = (page: Page) => page.getByLabel("Lesson tools");
const dividerGap = (page: Page) => page.evaluate(() => {
  const sidebar = document.querySelector('[data-slot="sidebar-separator"]')!.getBoundingClientRect().top;
  // Both dividers are 1px lines; compare their top edges.
  const footer = document.querySelector(".ce-editor-footer")!.getBoundingClientRect().top;
  return Math.abs(sidebar - footer);
});

test("canvas-first toolbar replaces the side panels; outline opens over the canvas without moving it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(editor);
  await expect(page.locator(".ce-elements, .ce-properties")).toHaveCount(0);
  const outline = tools(page).getByRole("button", { name: "Lesson outline" });
  await expect(outline).toHaveAttribute("aria-expanded", "false");
  const canvas = page.locator(".ce-canvas");
  await canvas.evaluate(el => { el.scrollTop = 400; });
  await outline.click();
  await expect(outline).toHaveAttribute("aria-expanded", "true");
  const panel = page.getByRole("region", { name: "Lesson outline" });
  await expect(panel).toBeVisible();
  expect(await canvas.evaluate(el => el.scrollTop)).toBe(400);
  await panel.getByRole("button", { name: "Collapse all" }).click();
  await expect(panel.locator(".ce-outline-block")).toHaveCount(0);
  await panel.getByRole("button", { name: "Expand all" }).click();
  await expect(panel.locator(".ce-outline-block").first()).toBeVisible();
  await panel.getByRole("button", { name: "Close lesson outline" }).click();
  await expect(panel).toHaveCount(0);
  await expect(tools(page).getByRole("button", { name: "Lesson templates" })).toHaveAttribute("aria-haspopup", "dialog");
});

test("lesson templates add independent modules (with Undo) or create a separate new lesson", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(editor);
  const modules = page.locator(".ce-canvas .ce-module");
  await expect(modules.first()).toBeVisible();
  const before = await modules.count();
  await tools(page).getByRole("button", { name: "Lesson templates" }).click();
  const dialog = page.getByRole("dialog", { name: "Lesson templates" });
  await dialog.getByRole("textbox", { name: "Search lesson templates" }).fill("zzz-no-match");
  await expect(dialog).toContainText("No lesson templates match");
  await dialog.getByRole("textbox", { name: "Search lesson templates" }).fill("");
  const first = dialog.locator(".ce-template").first();
  const added = Number((await first.locator(".tw-subtle").first().textContent())!.match(/\d+/)![0]);
  await first.getByRole("button", { name: "Add to this lesson" }).click();
  await expect(modules).toHaveCount(before + added);
  await tools(page).getByRole("button", { name: "Undo" }).click();
  await expect(modules).toHaveCount(before);
  await tools(page).getByRole("button", { name: "Lesson templates" }).click();
  const title = await page.getByRole("dialog").locator(".ce-template h3").first().textContent();
  await page.getByRole("dialog").locator(".ce-template").first().getByRole("button", { name: "Create a new lesson" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  // A separate lesson opens; the previous draft and the template are untouched.
  await expect(page.getByText("New lesson created from the template.", { exact: false })).toBeVisible();
  expect(title).toBeTruthy();
  await expect(modules).toHaveCount(added);
});

test("repeated items reorder with keyboard buttons and keep their attached data", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(editor);
  const block = page.locator(".ce-canvas .ce-canvas-block").first();
  const word1 = block.getByLabel("Word or phrase 1", { exact: true }), meaning1 = block.getByLabel("English meaning 1", { exact: true });
  const [w, m] = [await word1.inputValue(), await meaning1.inputValue()];
  await block.getByRole("button", { name: "Move card 1 later" }).click();
  await expect(block.getByLabel("Word or phrase 2", { exact: true })).toHaveValue(w);
  await expect(block.getByLabel("English meaning 2", { exact: true })).toHaveValue(m);
  await tools(page).getByRole("button", { name: "Undo" }).click();
  await expect(word1).toHaveValue(w);
});

test("drop zones reject unsupported files without changing content, and page drops are ignored", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(editor);
  const block = page.locator(".ce-canvas .ce-canvas-block").first();
  await block.locator(".ce-card-media summary").first().click();
  const zone = block.locator(".ce-dropzone").first();
  await zone.evaluate(el => {
    const data = new DataTransfer();
    data.items.add(new File(["hello"], "notes.txt", { type: "text/plain" }));
    el.dispatchEvent(new DragEvent("drop", { dataTransfer: data, bubbles: true, cancelable: true }));
  });
  await expect(zone.getByRole("alert")).toContainText("isn’t a supported file type");
  const url = page.url();
  await page.locator(".ce-lesson-heading").evaluate(el => {
    const data = new DataTransfer();
    data.items.add(new File(["x"], "photo.png", { type: "image/png" }));
    el.dispatchEvent(new DragEvent("drop", { dataTransfer: data, bubbles: true, cancelable: true }));
  });
  expect(page.url()).toBe(url);
});

test("student preview follows the edited block, pauses on interaction and resumes with Follow editor", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(editor);
  const preview = page.getByRole("region", { name: "Student preview" });
  const grammar = page.locator(".ce-canvas .ce-module").nth(2);
  await grammar.locator(".ce-canvas-block").first().getByLabel("Block title", { exact: true }).focus();
  await expect(preview.locator(".ce-live-heading")).toContainText("Grammar");
  await preview.getByRole("button", { name: "Next block" }).click();
  await expect(preview.getByRole("button", { name: "Follow editor" })).toBeVisible();
  await preview.getByRole("button", { name: "Follow editor" }).click();
  await expect(preview.locator(".ce-live-heading")).toContainText("Grammar");
  const frame = await preview.locator(".ce-live-frame").boundingBox(), stage = await preview.locator(".ce-live-stage").boundingBox();
  expect(frame!.y + frame!.height).toBeLessThanOrEqual(stage!.y + stage!.height + 1);
  expect(Math.abs(frame!.width / frame!.height - 393 / 780)).toBeLessThan(0.01);
});

for (const [width, height] of [[1280, 720], [1440, 1000]]) {
  test(`footer dividers align at ${width}×${height}, sidebar expanded and collapsed`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto(editor);
    await expect(page.locator(".ce-editor-footer")).toBeVisible();
    await expect(page.locator('[data-slot="sidebar-separator"]')).toHaveCount(1);
    expect(await dividerGap(page)).toBeLessThanOrEqual(1);
    await tools(page).getByRole("button", { name: "Lesson outline" }).click();
    await page.locator(".ce-canvas").evaluate(el => { el.scrollTop = el.scrollHeight; });
    expect(await dividerGap(page)).toBeLessThanOrEqual(1);
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    await page.waitForTimeout(400);
    expect(await dividerGap(page)).toBeLessThanOrEqual(1);
    for (const name of ["Back", "Save draft", "Use lesson"]) await expect(page.getByRole("button", { name, exact: true })).toBeInViewport();
  });
}

for (const view of ["web", "mobile"] as const) {
  test(`${view} teaching profile shows the photo/video option before the profile fields`, async ({ page }) => {
    await page.goto(`/?view=${view}`);
    const current = () => view === "web" ? page.getByTestId("web-onboarding-current") : page.getByTestId("flow-current");
    const action = (name: string) => (view === "web" ? current() : page.getByTestId("flow-fixed-footer")).getByRole("button", { name, exact: true });
    await action("Get started").click();
    await current().getByRole("button", { name: /I want to teach/ }).click();
    await action("Continue").click();
    await current().getByRole("button", { name: /^Create an account/ }).click();
    await current().getByRole("button", { name: "Continue with Google", exact: true }).click();
    await action("Continue as Alex").click();
    const media = current().getByText("Add a photo or video (optional)", { exact: true });
    await expect(media).toBeInViewport();
    const [mediaBox, nameBox] = [await media.boundingBox(), await current().getByRole("textbox", { name: "Display name" }).boundingBox()];
    expect(mediaBox!.y).toBeLessThan(nameBox!.y);
    await expect(current().getByRole("textbox", { name: "Language teaching experience (optional)" })).toBeVisible();
  });
}
