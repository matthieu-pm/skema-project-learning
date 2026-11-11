import { expect, type Locator, type Page } from "@playwright/test";

export async function expectSetupProgress(page: Page, step: number, total: number) {
  const progress = page.getByRole("progressbar", { name: "Setup progress", exact: true });
  await expect(progress).toHaveCount(1);
  await expect(progress).toHaveAttribute("aria-valuemax", String(total));
  await expect(progress).toHaveAttribute("aria-valuenow", String(step));
  await expect(progress).toHaveAttribute("aria-valuetext", `Step ${step} of ${total}`);
}

/** The web wizard's action follows its current content and stays inside the form. */
export async function expectCompactWebAction(page: Page, scope: Locator, actionName: string) {
  const action = scope.getByRole("button", { name: actionName, exact: true });
  await action.scrollIntoViewIfNeeded();
  await expect(action).toBeInViewport();
  const body = (await scope.locator(".onboarding-content").boundingBox())!;
  const button = (await action.boundingBox())!;
  const stage = (await scope.boundingBox())!;
  expect(button.y).toBeGreaterThanOrEqual(body.y + body.height - 2);
  expect(button.y - (body.y + body.height)).toBeLessThanOrEqual(96);
  expect(button.x).toBeGreaterThanOrEqual(stage.x - 1);
  expect(button.x + button.width).toBeLessThanOrEqual(stage.x + stage.width + 1);
  expect(button.y + button.height).toBeLessThanOrEqual(stage.y + stage.height + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
