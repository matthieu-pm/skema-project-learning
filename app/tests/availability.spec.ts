import { expect, test, type Locator, type Page } from "@playwright/test";
import { expectSelectedChoice, selectChoice } from "./helpers/select";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const content = (page: Page) => page.locator(".teacher-web .tw-content");
const availability = (page: Page) => page.locator(".tw-availability");
const navigation = (page: Page) => page.getByRole("navigation", { name: "Teaching workspace", exact: true });
const timeField = (scope: Locator, day: string, boundary: "start" | "end", slot = 1) => scope.getByLabel(`${day} slot ${slot} ${boundary} time`, { exact: true });
const copyTrigger = (scope: Locator, day: string) => scope.getByRole("button", { name: `Copy ${day} hours`, exact: true });
const slotGroups = (scope: Locator, day: string) => scope.getByRole("group", { name: new RegExp(`^${day} time slot \\d+$`) });

async function setRange(scope: Locator, day: string, start: string, end: string, slot = 1) {
  await timeField(scope, day, "start", slot).fill(start);
  await timeField(scope, day, "end", slot).fill(end);
}

async function addSlot(scope: Locator, day: string, start: string, end: string) {
  const count = await slotGroups(scope, day).count();
  await scope.getByRole("button", { name: `Add ${day} time slot`, exact: true }).click();
  await expect(slotGroups(scope, day)).toHaveCount(count + 1);
  await setRange(scope, day, start, end, count + 1);
}

async function openCopy(page: Page, scope: Locator, day: string) {
  await copyTrigger(scope, day).click();
  const dialog = page.getByRole("dialog", { name: `Copy ${day} hours`, exact: true });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function expectCopyFooterVisible(dialog: Locator) {
  // Check before clicking a footer action can auto-scroll it into view.
  for (const name of ["Cancel", "Copy hours"]) {
    const action = dialog.getByRole("button", { name, exact: true });
    await expect(action).toBeInViewport({ ratio: 1 });
    const popup = (await dialog.boundingBox())!;
    const button = (await action.boundingBox())!;
    expect(button.x).toBeGreaterThanOrEqual(popup.x - 1);
    expect(button.y).toBeGreaterThanOrEqual(popup.y - 1);
    expect(button.x + button.width).toBeLessThanOrEqual(popup.x + popup.width + 1);
    expect(button.y + button.height).toBeLessThanOrEqual(popup.y + popup.height + 1);
  }
}

async function scrollCopyTargets(page: Page, dialog: Locator, edge: "start" | "end") {
  const targets = dialog.getByRole("group", { name: "Copy hours to", exact: true });
  await targets.hover();
  await page.mouse.wheel(0, edge === "end" ? 600 : -600);
  const option = dialog.getByRole("checkbox", { name: edge === "end" ? "Sunday" : "Select all days", exact: true });
  await expect(option).toBeInViewport({ ratio: 1 });
  if (edge === "end") expect(await targets.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  else await expect.poll(() => targets.evaluate(element => element.scrollTop)).toBe(0);
  await expectCopyFooterVisible(dialog);
}

async function openWebAvailability(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?teacher=1&view=web");
  await navigation(page).getByRole("button", { name: "Availability", exact: true }).click();
  await expect(availability(page)).toBeVisible();
  return availability(page);
}

async function onlyTeachingDays(scope: Locator, selected: string[]) {
  for (const day of weekdays) {
    const control = scope.getByRole("switch", { name: day, exact: true });
    if ((await control.getAttribute("aria-checked") === "true") !== selected.includes(day)) await control.click();
  }
}

async function openAccountPage(page: Page, name: "Account settings" | "Teaching profile") {
  await page.getByRole("button", { name: "Teacher account menu", exact: true }).click();
  await page.getByRole("menuitem", { name, exact: true }).click();
}

async function expectNoOverflow(scope: Locator) {
  expect(await scope.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
}

test("independent weekday hours survive saving, toggling and later workspace navigation", async ({ page }) => {
  const form = await openWebAvailability(page);
  const state = form.locator(".tw-availability-save-state");
  await expect(state).toHaveText("Unsaved changes");
  await page.setViewportSize({ width: 1280, height: 720 });
  const rows = form.getByRole("list", { name: "Weekly availability", exact: true }).getByRole("listitem");
  await expect(rows).toHaveCount(7);
  expect(await form.getByRole("switch", { checked: true }).count()).toBeGreaterThan(0);
  expect(await form.getByRole("switch", { checked: false }).count()).toBeGreaterThan(0);
  for (const row of await rows.all()) await expect(row).toBeInViewport({ ratio: 1 });
  const heights = await rows.evaluateAll(elements => elements.map(element => element.getBoundingClientRect().height));
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(0.5);
  await onlyTeachingDays(form, ["Monday", "Tuesday"]);
  await setRange(form, "Monday", "10:30", "16:15");
  await setRange(form, "Tuesday", "12:00", "18:00");
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toBeVisible();
  await expect(state).toHaveText("Saved");
  await expect(page.locator(".tw-notice")).toContainText("Availability saved");

  await timeField(form, "Monday", "end").fill("15:45");
  await expect(form.getByRole("button", { name: "Save availability", exact: true })).toBeVisible();
  await expect(state).toHaveText("Unsaved changes");
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toHaveCount(0);
  await expect(timeField(form, "Tuesday", "start")).toHaveValue("12:00");
  await expect(timeField(form, "Tuesday", "end")).toHaveValue("18:00");
  const tuesday = form.getByRole("switch", { name: "Tuesday", exact: true });
  await tuesday.click();
  await expect(tuesday).toHaveAttribute("aria-checked", "false");
  await tuesday.click();
  await expect(timeField(form, "Tuesday", "start")).toHaveValue("12:00");
  await expect(timeField(form, "Tuesday", "end")).toHaveValue("18:00");
  await navigation(page).getByRole("button", { name: "Students", exact: true }).click();
  await navigation(page).getByRole("button", { name: "Availability", exact: true }).click();
  await expect(timeField(form, "Monday", "start")).toHaveValue("10:30");
  await expect(timeField(form, "Monday", "end")).toHaveValue("15:45");
  await expect(timeField(form, "Tuesday", "start")).toHaveValue("12:00");
  await expect(timeField(form, "Tuesday", "end")).toHaveValue("18:00");
  for (const day of weekdays) await expect(form.getByRole("switch", { name: day, exact: true })).toHaveAttribute("aria-checked", ["Monday", "Tuesday"].includes(day) ? "true" : "false");
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toBeVisible();
});

test("multiple weekday slots can be added, retained and removed with adjacent hours allowed and overlap recovery", async ({ page }) => {
  const form = await openWebAvailability(page);
  await onlyTeachingDays(form, ["Monday", "Tuesday"]);
  await setRange(form, "Monday", "09:00", "12:00");
  await setRange(form, "Tuesday", "06:00", "08:00");
  await expect(form.getByRole("button", { name: "Remove Monday time slot 1", exact: true })).toHaveCount(0);
  await addSlot(form, "Monday", "12:00", "14:00");
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toBeVisible();
  await addSlot(form, "Monday", "15:00", "16:00");
  const monday = form.getByRole("switch", { name: "Monday", exact: true });
  await monday.click();
  await monday.click();
  await expect(slotGroups(form, "Monday")).toHaveCount(3);
  await expect(timeField(form, "Monday", "start", 2)).toHaveValue("12:00");
  await expect(timeField(form, "Monday", "end", 3)).toHaveValue("16:00");
  await form.getByRole("button", { name: "Remove Monday time slot 2", exact: true }).click();
  await expect(slotGroups(form, "Monday")).toHaveCount(2);
  await expect(timeField(form, "Monday", "start", 2)).toHaveValue("15:00");
  await expect(timeField(form, "Monday", "end", 2)).toHaveValue("16:00");
  await timeField(form, "Monday", "start", 2).fill("11:30");
  await expect(copyTrigger(form, "Monday")).toBeDisabled();
  await expect(form).toContainText("Fix Monday hours before copying.");
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("alert").first()).toContainText(/Monday.*overlap|overlap.*Monday/i);
  await timeField(form, "Monday", "start", 2).fill("12:00");
  await expect(copyTrigger(form, "Monday")).toBeEnabled();
  await expect(form.getByRole("alert")).toHaveCount(0);
  await addSlot(form, "Monday", "", "18:00");
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("alert").first()).toContainText("Monday");
  await expect(copyTrigger(form, "Monday")).toBeDisabled();
  await form.getByRole("button", { name: "Remove Monday time slot 3", exact: true }).click();
  await expect(slotGroups(form, "Monday")).toHaveCount(2);
  await expect(timeField(form, "Tuesday", "start")).toHaveValue("06:00");
  await expect(timeField(form, "Tuesday", "end")).toHaveValue("08:00");
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toBeVisible();
});

test("copying slots replaces and enables selected weekdays without linking their later edits", async ({ page }) => {
  const form = await openWebAvailability(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  await setRange(form, "Monday", "09:00", "12:00");
  await addSlot(form, "Monday", "13:00", "16:00");
  await setRange(form, "Tuesday", "06:00", "07:00");
  await addSlot(form, "Tuesday", "08:00", "09:00");
  await addSlot(form, "Tuesday", "10:00", "11:00");
  const dialog = await openCopy(page, form, "Monday");
  await expectCopyFooterVisible(dialog);
  await expect(dialog).toContainText("Replaces hours and turns selected days on.");
  await dialog.getByRole("checkbox", { name: "Tuesday", exact: true }).click();
  await scrollCopyTargets(page, dialog, "end");
  await expect(dialog.getByRole("checkbox", { name: "Tuesday", exact: true })).toBeChecked();
  await expect(dialog.getByRole("checkbox", { name: "Sunday", exact: true })).not.toBeChecked();
  await scrollCopyTargets(page, dialog, "start");
  await dialog.getByRole("checkbox", { name: "Wednesday", exact: true }).click();
  await dialog.getByRole("button", { name: "Copy hours", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(copyTrigger(form, "Monday")).toBeFocused();
  for (const day of ["Tuesday", "Wednesday"]) {
    await expect(form.getByRole("switch", { name: day, exact: true })).toHaveAttribute("aria-checked", "true");
    await expect(slotGroups(form, day)).toHaveCount(2);
    await expect(timeField(form, day, "start")).toHaveValue("09:00");
    await expect(timeField(form, day, "end")).toHaveValue("12:00");
    await expect(timeField(form, day, "start", 2)).toHaveValue("13:00");
    await expect(timeField(form, day, "end", 2)).toHaveValue("16:00");
  }
  await timeField(form, "Monday", "start", 2).fill("13:15");
  await timeField(form, "Tuesday", "end", 2).fill("16:30");
  await timeField(form, "Wednesday", "start").fill("08:45");
  await expect(timeField(form, "Monday", "start")).toHaveValue("09:00");
  await expect(timeField(form, "Monday", "end", 2)).toHaveValue("16:00");
  await expect(timeField(form, "Tuesday", "start")).toHaveValue("09:00");
  await expect(timeField(form, "Tuesday", "start", 2)).toHaveValue("13:00");
  await expect(timeField(form, "Wednesday", "start", 2)).toHaveValue("13:00");
  await expect(timeField(form, "Wednesday", "end", 2)).toHaveValue("16:00");
  await expect(slotGroups(form, "Thursday")).toHaveCount(1);
  await expect(timeField(form, "Thursday", "start")).toHaveValue("09:00");
  await expect(timeField(form, "Thursday", "end")).toHaveValue("17:00");
  await expect(form.getByRole("switch", { name: "Saturday", exact: true })).toHaveAttribute("aria-checked", "false");
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toBeVisible();
  await navigation(page).getByRole("button", { name: "Students", exact: true }).click();
  await navigation(page).getByRole("button", { name: "Availability", exact: true }).click();
  await expect(timeField(form, "Monday", "start", 2)).toHaveValue("13:15");
  await expect(timeField(form, "Tuesday", "end", 2)).toHaveValue("16:30");
  await expect(timeField(form, "Wednesday", "start")).toHaveValue("08:45");
});

test("copy selection is explicit and Cancel or Escape preserves hours and saved state", async ({ page }) => {
  const form = await openWebAvailability(page);
  await page.setViewportSize({ width: 1280, height: 520 });
  await setRange(form, "Monday", "09:00", "12:00");
  await addSlot(form, "Monday", "13:00", "16:00");
  await setRange(form, "Tuesday", "06:00", "08:00");
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  const trigger = copyTrigger(form, "Monday");
  let dialog = await openCopy(page, form, "Monday");
  await expectCopyFooterVisible(dialog);
  await expect(dialog.getByRole("button", { name: "Copy hours", exact: true })).toBeDisabled();
  for (const day of weekdays.filter(day => day !== "Monday")) await expect(dialog.getByRole("checkbox", { name: day, exact: true })).not.toBeChecked();
  const selectAll = dialog.getByRole("checkbox", { name: "Select all days", exact: true });
  await selectAll.click();
  for (const day of weekdays.filter(day => day !== "Monday")) await expect(dialog.getByRole("checkbox", { name: day, exact: true })).toBeChecked();
  await scrollCopyTargets(page, dialog, "end");
  await expect(dialog.getByRole("checkbox", { name: "Sunday", exact: true })).toBeChecked();
  await expect(dialog.getByRole("checkbox", { name: "Tuesday", exact: true })).toBeChecked();
  await scrollCopyTargets(page, dialog, "start");
  await dialog.getByRole("checkbox", { name: "Tuesday", exact: true }).click();
  await expect(selectAll).toHaveAttribute("aria-checked", "mixed");
  await selectAll.click();
  await expect(selectAll).toBeChecked();
  await selectAll.click();
  await expect(dialog.getByRole("button", { name: "Copy hours", exact: true })).toBeDisabled();
  await dialog.getByRole("checkbox", { name: "Tuesday", exact: true }).click();
  await dialog.getByRole("checkbox", { name: "Wednesday", exact: true }).click();
  await expect(timeField(form, "Tuesday", "start")).toHaveValue("06:00");
  await expect(form.locator(".tw-availability-save-state")).toHaveText("Saved");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(timeField(form, "Tuesday", "start")).toHaveValue("06:00");
  await expect(form.getByRole("switch", { name: "Wednesday", exact: true })).toHaveAttribute("aria-checked", "false");
  await expect(form.locator(".tw-availability-save-state")).toHaveText("Saved");
  await trigger.press("Space");
  dialog = page.getByRole("dialog", { name: "Copy Monday hours", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Copy hours", exact: true })).toBeDisabled();
  const friday = dialog.getByRole("checkbox", { name: "Friday", exact: true });
  await friday.focus();
  await friday.press("Space");
  await expect(friday).toBeChecked();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(slotGroups(form, "Friday")).toHaveCount(1);
  await expect(timeField(form, "Friday", "end")).toHaveValue("17:00");
  await expect(form.locator(".tw-availability-save-state")).toHaveText("Saved");
});

test("availability rejects no days, missing times and equal or reversed ranges, with editable recovery", async ({ page }) => {
  const form = await openWebAvailability(page);
  const save = form.getByRole("button", { name: "Save availability", exact: true });
  const start = timeField(form, "Monday", "start");
  const end = timeField(form, "Monday", "end");
  const errors = form.getByRole("alert");
  await onlyTeachingDays(form, []);
  await save.click();
  await expect(errors.first()).toBeVisible();
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toHaveCount(0);

  await form.getByRole("switch", { name: "Monday", exact: true }).click();
  await expect(errors).toHaveCount(0);
  for (const [from, to] of [["", "17:00"], ["09:00", ""], ["09:00", "09:00"], ["17:00", "09:00"]]) {
    await start.fill(from);
    await end.fill(to);
    await save.click();
    await expect(errors.first()).toBeVisible();
    await expect(errors.first()).toContainText("Monday");
    await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toHaveCount(0);
  }
  await start.fill("09:30");
  await end.fill("10:00");
  await expect(errors).toHaveCount(0);
  await save.click();
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toBeVisible();
});

test("invalid enabled-day hours block saving while disabled-day hours are retained and ignored", async ({ page }) => {
  const form = await openWebAvailability(page);
  await onlyTeachingDays(form, ["Monday", "Tuesday"]);
  await setRange(form, "Monday", "09:00", "10:00");
  await setRange(form, "Tuesday", "17:00", "09:00");
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("alert").first()).toContainText("Tuesday");
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toHaveCount(0);
  const tuesday = form.getByRole("switch", { name: "Tuesday", exact: true });
  await tuesday.click();
  await expect(form.getByRole("alert")).toHaveCount(0);
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toBeVisible();
  await tuesday.click();
  await expect(timeField(form, "Tuesday", "start")).toHaveValue("17:00");
  await expect(timeField(form, "Tuesday", "end")).toHaveValue("09:00");
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("alert").first()).toContainText("Tuesday");
  await setRange(form, "Tuesday", "14:00", "18:00");
  await expect(timeField(form, "Monday", "start")).toHaveValue("09:00");
  await expect(timeField(form, "Monday", "end")).toHaveValue("10:00");
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toBeVisible();
});

test("unsupported time zones cannot save and keyboard dismissal preserves the Paris recovery", async ({ page }) => {
  const form = await openWebAvailability(page);
  const zone = form.getByRole("combobox", { name: "Time zone", exact: true });
  await timeField(form, "Monday", "start").fill("11:15");
  await selectChoice(page, zone, "Europe/London");
  await expect(form.getByRole("alert")).toContainText("Europe/Paris");
  await expect(form.getByRole("button", { name: "Save availability", exact: true })).toBeDisabled();
  await zone.focus();
  await zone.press("Space");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(zone).toBeFocused();
  await expectSelectedChoice(zone, "Europe/London");
  await selectChoice(page, zone, "Europe/Paris");
  await expect(form.getByRole("alert")).toHaveCount(0);
  await expect(timeField(form, "Monday", "start")).toHaveValue("11:15");
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toBeVisible();
});

test("a connection failure retains availability edits for a successful retry", async ({ page }) => {
  const form = await openWebAvailability(page);
  await onlyTeachingDays(form, ["Tuesday", "Friday"]);
  await setRange(form, "Tuesday", "12:30", "18:30");
  await setRange(form, "Friday", "08:00", "11:00");
  await openAccountPage(page, "Account settings");
  const connection = content(page).getByRole("switch", { name: "Connection available", exact: true });
  await connection.click();
  await expect(connection).toHaveAttribute("aria-checked", "false");
  await navigation(page).getByRole("button", { name: "Availability", exact: true }).click();
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(page.locator(".tw-notice")).toContainText("Connection unavailable");
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toHaveCount(0);
  await expect(timeField(form, "Tuesday", "start")).toHaveValue("12:30");
  await expect(timeField(form, "Tuesday", "end")).toHaveValue("18:30");
  await expect(timeField(form, "Friday", "start")).toHaveValue("08:00");
  await expect(timeField(form, "Friday", "end")).toHaveValue("11:00");
  await openAccountPage(page, "Account settings");
  await connection.click();
  await expect(connection).toHaveAttribute("aria-checked", "true");
  await navigation(page).getByRole("button", { name: "Availability", exact: true }).click();
  await expect(form.getByRole("switch", { name: "Tuesday", exact: true })).toHaveAttribute("aria-checked", "true");
  await expect(form.getByRole("switch", { name: "Friday", exact: true })).toHaveAttribute("aria-checked", "true");
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toBeVisible();
  await expect(page.locator(".tw-notice")).toContainText("Availability saved");
});

test("availability remains saveable when teaching duration and price are not set", async ({ page }) => {
  const form = await openWebAvailability(page);
  await openAccountPage(page, "Teaching profile");
  await content(page).getByRole("button", { name: "Edit teaching profile", exact: true }).click();
  await selectChoice(page, content(page).getByRole("combobox", { name: "Lesson duration", exact: true }), "Not set");
  await content(page).getByLabel("Price per lesson in euros", { exact: true }).fill("");
  await content(page).getByRole("button", { name: "Review teaching profile", exact: true }).click();
  await content(page).getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(content(page)).toContainText("Duration not set");
  await navigation(page).getByRole("button", { name: "Availability", exact: true }).click();
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toBeVisible();
});

test("reducing open teaching hours preserves every existing confirmed booking", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?teacher=1&view=web&flow=schedule");
  const calendar = page.getByRole("region", { name: "Week calendar", exact: true });
  const confirmed = calendar.getByRole("button", { name: /, \d\d:\d\d, \d+ minutes, Confirmed$/ });
  await expect(calendar).toBeVisible();
  await expect(confirmed.first()).toBeVisible();
  const before = await confirmed.evaluateAll(elements => elements.map(element => element.getAttribute("aria-label")));
  expect(before.length).toBeGreaterThan(0);
  await content(page).getByRole("button", { name: "Set availability", exact: true }).click();
  const form = availability(page);
  await onlyTeachingDays(form, ["Monday"]);
  await setRange(form, "Monday", "07:00", "08:00");
  await form.getByRole("button", { name: "Save availability", exact: true }).click();
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toBeVisible();
  await navigation(page).getByRole("button", { name: "Schedule", exact: true }).click();
  await expect(calendar).toBeVisible();
  await expect(confirmed).toHaveCount(before.length);
  expect(await confirmed.evaluateAll(elements => elements.map(element => element.getAttribute("aria-label")))).toEqual(before);
});

test("narrow and 1024px web availability keep keyboard, slot and copy controls reachable without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 });
  await page.goto("/?teacher=1&view=web");
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await navigation(page).getByRole("button", { name: "Availability", exact: true }).click();
  const form = availability(page);
  const wednesday = form.getByRole("switch", { name: "Wednesday", exact: true });
  await wednesday.focus();
  await wednesday.press("Space");
  await expect(wednesday).toHaveAttribute("aria-checked", "true");
  await expect(wednesday).toBeFocused();
  await wednesday.press("Enter");
  await expect(wednesday).toHaveAttribute("aria-checked", "false");
  for (const day of weekdays) await expect(form.getByRole("switch", { name: day, exact: true })).toBeVisible();
  await timeField(form, "Monday", "end").fill("18:15");
  await addSlot(form, "Monday", "19:00", "20:00");
  await page.setViewportSize({ width: 1024, height: 900 });
  await expectNoOverflow(form);
  for (const control of [timeField(form, "Monday", "end", 2), form.getByRole("button", { name: "Add Monday time slot", exact: true }), copyTrigger(form, "Monday")]) {
    await control.scrollIntoViewIfNeeded();
    await expect(control).toBeInViewport({ ratio: 1 });
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 390, height: 640 });
  const trigger = copyTrigger(form, "Monday");
  await trigger.focus();
  await trigger.press("Space");
  const dialog = page.getByRole("dialog", { name: "Copy Monday hours", exact: true });
  await expect(dialog).toBeVisible();
  await expectCopyFooterVisible(dialog);
  await expectNoOverflow(dialog);
  const saturday = dialog.getByRole("checkbox", { name: "Saturday", exact: true });
  await saturday.focus();
  await saturday.press("Space");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(form.getByRole("switch", { name: "Saturday", exact: true })).toHaveAttribute("aria-checked", "false");
  await trigger.click();
  await dialog.getByRole("checkbox", { name: "Saturday", exact: true }).click();
  await dialog.getByRole("button", { name: "Copy hours", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(slotGroups(form, "Saturday")).toHaveCount(2);
  await expect(timeField(form, "Saturday", "start", 2)).toHaveValue("19:00");
  const save = form.getByRole("button", { name: "Save availability", exact: true });
  await save.scrollIntoViewIfNeeded();
  await expect(save).toBeInViewport();
  await expectNoOverflow(form);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await save.click();
  await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toBeVisible();
});

for (const device of ["iphone", "pixel-10"] as const) {
  test(`${device} availability retains native selection, visible keyboard editing and reachable save`, async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 1100 });
    await page.goto("/?teacher=1&view=mobile&flow=schedule");
    if (device === "pixel-10") {
      await page.getByTestId("device-picker").click();
      await page.getByTestId("device-option-pixel-10").click();
    }
    const screen = page.getByTestId("flow-current");
    await screen.getByRole("button", { name: "Set availability", exact: true }).click();
    const form = screen.locator(".tw-availability");
    await expect(form).toBeVisible();
    const zone = form.getByRole("combobox", { name: "Time zone", exact: true });
    await expect(zone).toHaveJSProperty("tagName", "SELECT");
    await selectChoice(page, zone, "Europe/London");
    await expect(form.getByRole("button", { name: "Save availability", exact: true })).toBeDisabled();
    await selectChoice(page, zone, "Europe/Paris");
    await expectSelectedChoice(zone, "Europe/Paris");
    const start = timeField(form, "Monday", "start");
    await start.fill("10:30");
    await expect(start).toBeFocused();
    const keyboard = page.getByTestId("keyboard-dock");
    await expect(keyboard).toHaveAttribute("data-visible", "true");
    await expect.poll(async () => {
      const field = await start.boundingBox();
      const dock = await keyboard.boundingBox();
      return !!field && !!dock && field.y + field.height <= dock.y + 1;
    }).toBe(true);
    await start.blur();
    await expect(keyboard).toHaveAttribute("data-visible", "false");
    await addSlot(form, "Monday", "18:00", "19:00");
    const trigger = copyTrigger(form, "Monday");
    let dialog = await openCopy(page, form, "Monday");
    await expect(keyboard).toHaveAttribute("data-visible", "false");
    await expectNoOverflow(dialog);
    await expect(dialog.getByRole("button", { name: "Copy hours", exact: true })).toBeDisabled();
    await dialog.getByRole("checkbox", { name: "Tuesday", exact: true }).click();
    if (device === "iphone") await page.keyboard.press("Escape");
    else await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(keyboard).toHaveAttribute("data-visible", "false");
    await expect(slotGroups(form, "Tuesday")).toHaveCount(1);
    dialog = await openCopy(page, form, "Monday");
    await dialog.getByRole("checkbox", { name: "Wednesday", exact: true }).click();
    await dialog.getByRole("button", { name: "Copy hours", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(slotGroups(form, "Wednesday")).toHaveCount(2);
    await expect(timeField(form, "Wednesday", "start", 2)).toHaveValue("18:00");
    const saturday = form.getByRole("switch", { name: "Saturday", exact: true });
    await saturday.click();
    await expect(saturday).toHaveAttribute("aria-checked", "true");
    await setRange(form, "Saturday", "11:45", "14:15");
    await timeField(form, "Saturday", "end").blur();
    await expect(keyboard).toHaveAttribute("data-visible", "false");
    await expectNoOverflow(form);
    const save = form.getByRole("button", { name: "Save availability", exact: true });
    await save.scrollIntoViewIfNeeded();
    await expect.poll(async () => {
      const button = await save.boundingBox();
      const footer = await page.getByTestId("flow-fixed-footer").boundingBox();
      return !!button && !!footer && button.y + button.height <= footer.y + 1;
    }).toBe(true);
    await save.click();
    await expect(form.getByRole("button", { name: "Availability saved", exact: true })).toBeVisible();
    await expect(timeField(form, "Monday", "start")).toHaveValue("10:30");
    await expect(timeField(form, "Saturday", "start")).toHaveValue("11:45");
    await expect(timeField(form, "Saturday", "end")).toHaveValue("14:15");
  });
}
