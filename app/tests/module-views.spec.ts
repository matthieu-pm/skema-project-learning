import { expect, test, type Locator, type Page } from "@playwright/test";
import { expectSelectedChoice, selectChoice } from "./helpers/select";

async function wheelPane(page: Page, pane: Locator, amount: number) {
  const before = await pane.evaluate(element => element.scrollTop);
  const bounds = (await pane.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height - 30);
  await page.mouse.wheel(0, amount);
  if (amount > 0) await expect.poll(() => pane.evaluate(element => element.scrollTop)).toBeGreaterThan(before + amount / 2);
  else await expect.poll(() => pane.evaluate(element => element.scrollTop)).toBeLessThan(before + amount / 2);
}

for (const viewport of [{ width: 1280, height: 720 }, { width: 1024, height: 720 }, { width: 390, height: 640 }]) {
  test(`ongoing module views scroll away with page content at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/?teacher=1&view=web&flow=modules");
    const pane = page.locator(".teacher-web .tw-content");
    const toolbar = page.locator(".teacher-web .tw-toolbar");
    const switcher = pane.locator(".tw-module-views");
    const queue = pane.locator(".mr-queue");
    const firstRow = queue.locator(".mr-queue-row").first();
    await expect(firstRow).toBeVisible();
    await expect(switcher).toBeInViewport({ ratio: 1 });
    const switcherBefore = (await switcher.boundingBox())!.y;
    const scrollBefore = await pane.evaluate(element => element.scrollTop);
    const toolbarBefore = (await toolbar.boundingBox())!.y;
    const rowBefore = (await firstRow.boundingBox())!.y;
    await wheelPane(page, pane, 260);
    const scrollAfter = await pane.evaluate(element => element.scrollTop);
    const switcherAfter = (await switcher.boundingBox())!.y;
    expect(Math.abs(switcherAfter - (switcherBefore - (scrollAfter - scrollBefore)))).toBeLessThanOrEqual(1);
    await expect(switcher).not.toBeInViewport();
    const rowAfter = (await firstRow.boundingBox())!.y;
    expect(rowAfter).toBeLessThan(rowBefore - 130);
    await wheelPane(page, pane, 140);
    const scrollFurther = await pane.evaluate(element => element.scrollTop);
    expect(Math.abs((await switcher.boundingBox())!.y - (switcherAfter - (scrollFurther - scrollAfter)))).toBeLessThanOrEqual(1);
    await expect(switcher).not.toBeInViewport();
    expect((await firstRow.boundingBox())!.y).toBeLessThan(rowAfter - 70);
    expect((await toolbar.boundingBox())!.y).toBe(toolbarBefore);
    expect(await page.evaluate(() => document.documentElement.scrollTop)).toBe(0);

    await wheelPane(page, pane, -600);
    await expect.poll(() => pane.evaluate(element => element.scrollTop)).toBe(0);
    await expect(switcher).toBeInViewport({ ratio: 1 });
    await switcher.getByRole("button", { name: "Lessons by student", exact: true }).click();
    await expect(switcher.getByRole("button", { name: "Lessons by student", exact: true })).toHaveAttribute("aria-pressed", "true");
    const student = pane.getByRole("combobox", { name: "Select student", exact: true });
    await selectChoice(page, student, "Lucas Bernard");
    await expectSelectedChoice(student, "Lucas Bernard");
    await switcher.getByRole("button", { name: "Review queue", exact: true }).click();
    await expect(switcher.getByRole("button", { name: "Review queue", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(queue).toBeVisible();
    await expect(queue.getByRole("button", { name: "Review responses", exact: true }).first()).toBeEnabled();
    expect(await pane.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
