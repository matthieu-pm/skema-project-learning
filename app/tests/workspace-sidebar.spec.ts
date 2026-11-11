import { expect, test, type Locator, type Page } from "@playwright/test";

async function noHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

async function accountAbovePrimary(sidebar: Locator, accountName: string, actionName: string) {
  await expect(sidebar.getByText("Mimo", { exact: true })).toBeHidden();
  const account = sidebar.getByRole("button", { name: accountName, exact: true });
  const action = sidebar.getByRole("button", { name: actionName, exact: true });
  await expect(account).toBeVisible();
  await expect(account).not.toContainText(/Teacher account|Learner account/);
  await expect(action).toBeVisible();
  const accountBox = (await account.boundingBox())!;
  const actionBox = (await action.boundingBox())!;
  expect(accountBox.y + accountBox.height).toBeLessThanOrEqual(actionBox.y + 1);
}

async function headerTrigger(page: Page, workspace: "teacher" | "learner", name: string) {
  const toolbar = page.locator(workspace === "teacher" ? ".teacher-web .tw-toolbar" : ".learner-web .lw-toolbar");
  const trigger = toolbar.getByRole("button", { name, exact: true });
  const label = toolbar.locator(workspace === "teacher" ? ".tw-breadcrumb" : ".lw-breadcrumb").locator("..");
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute("data-sidebar", "trigger");
  const labelReference = await label.elementHandle();
  if (!labelReference) throw new Error("Workspace label is missing from the content header");
  expect(await trigger.evaluate((element, breadcrumb) => !!(element.compareDocumentPosition(breadcrumb) & Node.DOCUMENT_POSITION_FOLLOWING), labelReference)).toBe(true);
  // Narrow headers intentionally hide the workspace label to preserve control space.
  if (name !== "Open navigation") {
    await expect(label).toBeVisible();
    const button = (await trigger.boundingBox())!;
    const breadcrumb = (await label.boundingBox())!;
    expect(button.x + button.width).toBeLessThanOrEqual(breadcrumb.x + 1);
  }
  return trigger;
}

async function centeredCollapsedAvatar(sidebar: Locator, accountName: string, portrait: boolean) {
  const avatar = sidebar.getByRole("button", { name: accountName, exact: true }).locator(".mimo-sidebar-avatar");
  const image = avatar.locator("img.profile-portrait");
  await expect(image).toHaveCount(portrait ? 1 : 0);
  if (portrait) {
    await expect(image).toHaveJSProperty("complete", true);
    expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  } else await expect(avatar).toHaveText("A");
  const rail = (await sidebar.boundingBox())!;
  expect(Math.round(rail.width)).toBe(64);
  for (const target of portrait ? [avatar, image] : [avatar]) {
    const box = (await target.boundingBox())!;
    expect(Math.abs(box.x + box.width / 2 - (rail.x + rail.width / 2))).toBeLessThanOrEqual(0.5);
  }
}

test("teacher sidebar has precise active routes, a usable collapsed rail, and a keyboard account menu", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 640 });
  await page.goto("/?teacher=1&view=web&flow=results&student=lea");
  const sidebar = page.locator(".mimo-sidebar");
  await accountAbovePrimary(sidebar, "Teacher account menu", "New lesson");
  const collapse = await headerTrigger(page, "teacher", "Collapse navigation");
  await expect(sidebar.getByRole("button", { name: /^(Collapse|Expand) navigation$/ })).toHaveCount(0);
  const triggerReference = await collapse.elementHandle();
  const triggerSize = (await collapse.boundingBox())!;
  const navigation = sidebar.getByRole("navigation", { name: "Teaching workspace" });
  const active = navigation.locator('[aria-current="page"]');
  await expect(active).toHaveCount(1);
  await expect(active).toHaveAttribute("aria-label", "Ongoing modules");
  for (const label of ["Lesson templates", "Archive", "Lessons"]) {
    await navigation.getByRole("button", { name: label, exact: true }).click();
    await expect(active).toHaveCount(1);
    await expect(active).toHaveAttribute("aria-label", label);
  }
  await sidebar.getByRole("button", { name: "New lesson", exact: true }).click();
  await expect(page.locator(".tw-content").getByRole("button", { name: "Drafts", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(active).toHaveAttribute("aria-label", "Lessons");
  expect(Math.round((await sidebar.boundingBox())!.width)).toBe(248);
  const footer = await sidebar.locator(".mimo-sidebar-footer").boundingBox();
  expect(footer!.y + footer!.height).toBeLessThanOrEqual(640);
  await expect(sidebar.locator(".mimo-sidebar-footer").getByRole("button", { name: "Help & support", exact: true })).toBeVisible();
  await expect(sidebar.locator(".mimo-sidebar-footer").getByRole("link", { name: "Mobile app", exact: true })).toBeVisible();
  await noHorizontalOverflow(page);

  await collapse.click();
  await expect(sidebar).toHaveClass(/mimo-sidebar-collapsed/);
  expect(Math.round((await sidebar.boundingBox())!.width)).toBe(64);
  const expand = await headerTrigger(page, "teacher", "Expand navigation");
  expect(await expand.evaluate((element, reference) => element === reference, triggerReference)).toBe(true);
  expect((await expand.boundingBox())!.width).toBe(triggerSize.width);
  expect((await expand.boundingBox())!.height).toBe(triggerSize.height);
  await centeredCollapsedAvatar(sidebar, "Teacher account menu", true);
  const schedule = navigation.getByRole("button", { name: "Schedule", exact: true });
  await schedule.hover();
  await expect(page.getByRole("tooltip", { name: "Schedule", exact: true })).toBeVisible();
  await schedule.click();
  await expect(active).toHaveAttribute("aria-label", "Schedule");
  const account = sidebar.getByRole("button", { name: "Teacher account menu" });
  await account.focus();
  await account.press("Enter");
  await expect(page.getByRole("menuitem", { name: "Account settings", exact: true })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Teaching profile", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Account settings", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(account).toBeFocused();
  await noHorizontalOverflow(page);
});

test("narrow teacher web drawer dismisses after navigation and restores its trigger", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?teacher=1&view=web");
  const trigger = await headerTrigger(page, "teacher", "Open navigation");
  await trigger.click();
  const drawer = page.locator('.mimo-sidebar[data-mobile="true"]');
  await expect(drawer).toBeVisible();
  await accountAbovePrimary(drawer, "Teacher account menu", "New lesson");
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
  const sidebar = page.locator(".mimo-sidebar");
  await accountAbovePrimary(sidebar, "Learner account menu", "Find a teacher");
  const collapse = await headerTrigger(page, "learner", "Collapse navigation");
  await expect(sidebar.getByRole("button", { name: /^(Collapse|Expand) navigation$/ })).toHaveCount(0);
  const triggerReference = await collapse.elementHandle();
  const triggerSize = (await collapse.boundingBox())!;
  await collapse.click();
  await expect(sidebar).toHaveClass(/mimo-sidebar-collapsed/);
  await centeredCollapsedAvatar(sidebar, "Learner account menu", false);
  const expand = await headerTrigger(page, "learner", "Expand navigation");
  expect(await expand.evaluate((element, reference) => element === reference, triggerReference)).toBe(true);
  expect((await expand.boundingBox())!.width).toBe(triggerSize.width);
  expect((await expand.boundingBox())!.height).toBe(triggerSize.height);
  await sidebar.getByRole("button", { name: "Search", exact: true }).hover();
  await expect(page.getByRole("tooltip", { name: "Search", exact: true })).toBeVisible();
  await expand.click();
  expect(Math.round((await sidebar.boundingBox())!.width)).toBe(248);
  let navigation = page.getByRole("navigation", { name: "Learning workspace" });
  await expect(navigation.getByRole("button")).toHaveCount(5);
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(navigation.getByRole("button", { name: "Search", exact: true })).toHaveAttribute("aria-current", "page");
  await navigation.getByRole("button", { name: "Messages", exact: true }).click();
  await expect(navigation.getByRole("button", { name: "Messages", exact: true })).toHaveAttribute("aria-current", "page");
  const account = sidebar.getByRole("button", { name: "Learner account menu", exact: true });
  await account.focus();
  await account.press("Space");
  await expect(page.getByRole("menuitem", { name: "Learning profile", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Replay onboarding", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(account).toBeFocused();
  await noHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  const trigger = await headerTrigger(page, "learner", "Open navigation");
  await trigger.click();
  const drawer = page.locator('.mimo-sidebar[data-mobile="true"]');
  await accountAbovePrimary(drawer, "Learner account menu", "Find a teacher");
  navigation = drawer.getByRole("navigation", { name: "Learning workspace" });
  await navigation.getByRole("button", { name: "Lessons", exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator(".lw-content").getByRole("heading", { name: "Your lessons", exact: true })).toBeVisible();
  await trigger.click();
  await drawer.getByRole("button", { name: "Learner account menu", exact: true }).click();
  await page.getByRole("menuitem", { name: "Learning profile", exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator(".lw-content").getByRole("heading", { name: "Your learning profile", exact: true })).toBeVisible();
  await noHorizontalOverflow(page);
});
