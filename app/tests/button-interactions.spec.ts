import { expect, test, type Locator, type Page } from "@playwright/test";

async function editorButton(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?teacher=1&view=web&flow=editor&lesson=cafe");
  return page.getByRole("button", { name: "Save changes", exact: true });
}

async function moveToCenter(page: Page, button: Locator) {
  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  if (!box) throw new Error("Button is not visible");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

async function expectScale(button: Locator, value: number) {
  await expect.poll(() => button.evaluate(element => Number(Number.parseFloat(getComputedStyle(element).scale).toFixed(3)))).toBe(value);
}

test("pointer presses scale to .96 and reset after release or window blur", async ({ page }) => {
  const button = await editorButton(page);
  await expect(button).toHaveAttribute("data-slot", "button");
  await moveToCenter(page, button);
  await page.mouse.down();
  await expectScale(button, .96);
  await page.mouse.up();
  await expectScale(button, 1);
  await moveToCenter(page, button);
  await page.mouse.down();
  await expectScale(button, .96);
  // Losing window focus need not blur the active element itself.
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expectScale(button, 1);
  await expect(button).toHaveAttribute("data-pointer-pressed", "false");
  await page.mouse.move(1430, 990);
  await page.mouse.up();
});

test("keyboard activation keeps buttons still with clear focus and static controls never shrink", async ({ page }) => {
  const button = await editorButton(page);
  await button.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(button).toBeFocused();
  await page.keyboard.down("Space");
  await expectScale(button, 1);
  await expect(button).toHaveCSS("outline-width", "2px");
  await expect(button).toHaveCSS("outline-style", "solid");
  await expect(button).toHaveCSS("outline-color", "rgb(23, 23, 23)");
  await page.keyboard.up("Space");

  const collapse = page.getByRole("button", { name: "Collapse navigation", exact: true });
  await moveToCenter(page, collapse);
  await page.mouse.down();
  await expectScale(collapse, 1);
  await page.mouse.up();
});

test("reduced motion keeps a held primary action stationary", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?view=web");
  const button = page.getByRole("button", { name: "Get started", exact: true });
  await moveToCenter(page, button);
  await page.mouse.down();
  await expect(button).toHaveAttribute("data-pointer-pressed", "true");
  await expectScale(button, 1);
  await page.mouse.up();
  await expect(page.getByTestId("web-onboarding-current")).toHaveAttribute("data-web-step", "role");
});

test("a disabled account action cannot press or advance the flow", async ({ page }) => {
  await page.goto("/?view=web");
  await page.getByRole("button", { name: "Get started", exact: true }).click();
  await page.getByRole("button", { name: /I want to learn/ }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const button = page.getByRole("button", { name: "Continue with email", exact: true });
  await expect(button).toBeDisabled();
  await moveToCenter(page, button);
  await page.mouse.down();
  await expectScale(button, 1);
  await page.mouse.up();
  await expect(button).toHaveAttribute("data-pointer-pressed", "false");
  await expect(page.getByTestId("web-onboarding-current")).toHaveAttribute("data-web-step", "account");
});
