import { expect, test, type Page } from "@playwright/test";

async function noHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test("teacher sidebar has precise active routes, a usable collapsed rail, and a keyboard account menu", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 640 });
  await page.goto("/?teacher=1&view=web&flow=results&student=lea");
  const sidebar = page.locator(".mimo-sidebar");
  const navigation = sidebar.getByRole("navigation", { name: "Teaching workspace" });
  const active = navigation.locator('[aria-current="page"]');
  await expect(active).toHaveCount(1);
  await expect(active).toHaveAttribute("aria-label", "Ongoing modules");
  for (const label of ["Templates", "Archive", "Lessons"]) {
    await navigation.getByRole("button", { name: label, exact: true }).click();
    await expect(active).toHaveCount(1);
    await expect(active).toHaveAttribute("aria-label", label);
  }
  await sidebar.getByRole("button", { name: "New lesson", exact: true }).click();
  await expect(page.locator(".tw-content").getByRole("button", { name: "Module editor", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(active).toHaveAttribute("aria-label", "Lessons");
  expect(Math.round((await sidebar.boundingBox())!.width)).toBe(248);
  const footer = await sidebar.locator(".mimo-sidebar-footer").boundingBox();
  expect(footer!.y + footer!.height).toBeLessThanOrEqual(640);
  await expect(sidebar.getByRole("button", { name: "Teacher account menu" })).toBeVisible();
  await noHorizontalOverflow(page);

  await sidebar.getByRole("button", { name: "Collapse navigation" }).click();
  await expect(sidebar).toHaveClass(/mimo-sidebar-collapsed/);
  expect(Math.round((await sidebar.boundingBox())!.width)).toBe(64);
  const schedule = navigation.getByRole("button", { name: "Schedule", exact: true });
  await schedule.hover();
  await expect(page.getByRole("tooltip", { name: "Schedule", exact: true })).toBeVisible();
  await schedule.click();
  await expect(active).toHaveAttribute("aria-label", "Schedule");
  const account = sidebar.getByRole("button", { name: "Teacher account menu" });
  await account.focus();
  await account.press("Enter");
  await expect(page.getByRole("menuitem", { name: "Account settings", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(account).toBeFocused();
  await noHorizontalOverflow(page);
});

test("narrow teacher web drawer dismisses after navigation and restores its trigger", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?teacher=1&view=web");
  const trigger = page.getByRole("button", { name: "Open navigation", exact: true });
  await trigger.click();
  const drawer = page.locator('.mimo-sidebar[data-mobile="true"]');
  await expect(drawer).toBeVisible();
  await drawer.getByRole("navigation", { name: "Teaching workspace" }).getByRole("button", { name: "Availability", exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator(".tw-content").getByRole("heading", { name: "Availability", exact: true })).toBeVisible();

  await trigger.click();
  await drawer.getByRole("button", { name: "Teacher account menu" }).click();
  await page.getByRole("menuitem", { name: "Account settings", exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator(".tw-content").getByRole("heading", { name: "Account settings", exact: true })).toBeVisible();
  await trigger.click();
  await drawer.getByRole("button", { name: "Close navigation", exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await noHorizontalOverflow(page);
});

test("learner web shares the sidebar on desktop and narrow screens", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/?learner=1&view=web&flow=search");
  let navigation = page.getByRole("navigation", { name: "Learning workspace" });
  await expect(navigation.getByRole("button")).toHaveCount(5);
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(navigation.getByRole("button", { name: "Search", exact: true })).toHaveAttribute("aria-current", "page");
  await navigation.getByRole("button", { name: "Messages", exact: true }).click();
  await expect(navigation.getByRole("button", { name: "Messages", exact: true })).toHaveAttribute("aria-current", "page");
  await noHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  const trigger = page.getByRole("button", { name: "Open navigation", exact: true });
  await trigger.click();
  const drawer = page.locator('.mimo-sidebar[data-mobile="true"]');
  navigation = drawer.getByRole("navigation", { name: "Learning workspace" });
  await navigation.getByRole("button", { name: "Lessons", exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator(".lw-content").getByRole("heading", { name: "Your lessons", exact: true })).toBeVisible();
  await noHorizontalOverflow(page);
});
