import { expect, test, type Locator, type Page } from "@playwright/test";
import { selectChoice } from "./helpers/select";

const bookingsKey = "mimo.learner-bookings.v1";
const progressKey = "mimo.learner-preparation.v1";
const firstBooking = "preparation-gilbert-first";
const secondBooking = "preparation-gilbert-second";
const otherBooking = "preparation-diego";
const current = (page: Page, mobile = false) => mobile
  ? page.getByTestId("flow-current") : page.locator(".lw-web-main");
const preparationUrl = (booking = firstBooking, mobile = false) =>
  `/?learner=1&view=${mobile ? "mobile" : "web"}&flow=prepare&booking=${booking}`;

async function seedBookings(page: Page) {
  await page.addInitScript(({ key, ids }) => {
    // Keep receipts and progress on reload. Every Playwright test has its own origin storage.
    if (localStorage.getItem(key)) return;
    const make = (id: string, teacherId: string, days: number) => {
      const start = new Date();
      start.setUTCDate(start.getUTCDate() + days);
      start.setUTCHours(12, 0, 0, 0);
      const duration = teacherId === "gilbert" ? 30 : 45;
      return {
        id, teacherId, slotId: `fixture-${id}`, start: start.toISOString(),
        end: new Date(start.getTime() + duration * 60_000).toISOString(),
        format: "Online", status: "confirmed", paymentStatus: "paid",
        rate: teacherId === "gilbert" ? 30 : 22, duration,
        ...(teacherId === "gilbert" ? { preparationId: "gilbert-cafe-v1" } : {}),
      };
    };
    localStorage.setItem(key, JSON.stringify({ version: 1, bookings: [
      make(ids[0], "gilbert", 2), make(ids[1], "gilbert", 4), make(ids[2], "diego", 3),
    ] }));
  }, { key: bookingsKey, ids: [firstBooking, secondBooking, otherBooking] });
}

async function expectProgress(screen: Locator, completed: number) {
  await expect(screen.getByRole("progressbar", { name: "Preparation progress", exact: true }))
    .toHaveAttribute("value", String(completed));
  await expect(screen.locator(".lp-progress")).toContainText(`${completed} of 9 activities complete`);
}

async function fillWarmUp(screen: Locator) {
  await screen.getByRole("textbox", { name: "What is “a coffee” in French?", exact: true }).fill("un café");
  await screen.getByRole("textbox", { name: "What is “a tea” in French?", exact: true }).fill("un thé");
}

async function completeWarmUp(screen: Locator) {
  await fillWarmUp(screen);
  await screen.getByRole("button", { name: "Complete activity", exact: true }).click();
  await expectProgress(screen, 1);
  await expect(screen.getByRole("button", { name: "Next activity", exact: true })).toBeEnabled();
}

async function expectNoOverflow(scope: Locator) {
  await expect(scope).toHaveCount(1);
  expect(await scope.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
}

async function expectCoffeeAsset(screen: Locator) {
  const coffee = screen.locator('img[src="/assets/lessons/cafe-coffee.svg"]');
  await expect(coffee).toHaveCount(1);
  await expect.poll(() => coffee.evaluate((element: HTMLImageElement) =>
    element.complete && element.naturalWidth === 54 && element.naturalHeight === 54)).toBe(true);
  const geometry = await coffee.evaluate(element => {
    const style = getComputedStyle(element), box = element.getBoundingClientRect();
    return { width: parseFloat(style.width), height: parseFloat(style.height), ratio: box.width / box.height, filter: style.filter };
  });
  expect(geometry.width).toBe(54);
  expect(geometry.height).toBe(54);
  expect(geometry.ratio).toBeCloseTo(1, 3);
  expect(geometry.filter).toBe("none");
}

async function expectPhoneFieldVisible(page: Page, field: Locator) {
  const screen = current(page, true);
  const keyboard = page.getByTestId("keyboard-dock");
  await expect(field).toBeFocused();
  await expect(keyboard).toHaveAttribute("data-visible", "true");
  await expect.poll(() => keyboard.evaluate(element =>
    Math.abs(new DOMMatrixReadOnly(getComputedStyle(element).transform).m42))).toBeLessThan(1);
  await expect.poll(async () => {
    const answer = await field.boundingBox(), dock = await keyboard.boundingBox();
    const viewport = await screen.getByTestId("mobile-scroll").boundingBox();
    const footer = await page.getByTestId("flow-fixed-footer").boundingBox();
    return !!answer && !!dock && !!viewport && !!footer && answer.y >= viewport.y - 1
      && answer.y + answer.height <= Math.min(dock.y, footer.y, viewport.y + viewport.height) + 1;
  }).toBe(true);
}

test("desktop completes the six-module curriculum, restores answers and invalidates edited completion", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 1050 });
  await seedBookings(page);
  await page.goto("/?learner=1&view=web&flow=lessons");
  const screen = current(page);
  await screen.getByRole("tab", { name: /^Upcoming/ }).click();
  await expect(screen.locator(".lw-lesson-card")).toHaveCount(3);
  await expect(screen.getByRole("button", { name: "Prepare for lesson", exact: true })).toHaveCount(2);
  await screen.getByRole("button", { name: "Prepare for lesson", exact: true }).first().click();
  await expect(screen.getByRole("heading", { name: "Prepare for your lesson", exact: true })).toBeVisible();
  await expect(screen.locator(".lp-module-list > li")).toHaveCount(6);
  await expectProgress(screen, 0);
  await expectNoOverflow(screen.locator(".lw-content"));
  await page.screenshot({ path: "qa/session-preparation/desktop-curriculum.png" });

  await screen.getByRole("button", { name: "Start Warm-up", exact: true }).click();
  await expectCoffeeAsset(screen);
  await expect(screen.getByRole("button", { name: "Next activity", exact: true })).toBeDisabled();
  await expect(screen.getByRole("button", { name: "Complete activity", exact: true })).toBeDisabled();
  await completeWarmUp(screen);
  await expect(screen.getByRole("status", { name: "Answer-key result", exact: true })).toContainText("Expected answer: un café");
  await page.reload();
  // Workspace routes are initial selections; a reload returns to the original Lessons URL.
  await screen.getByRole("button", { name: "Continue preparation", exact: true }).click();
  await expectProgress(screen, 1);
  await screen.getByRole("button", { name: "Review Warm-up", exact: true }).click();
  const coffee = screen.getByRole("textbox", { name: "What is “a coffee” in French?", exact: true });
  await expect(coffee).toHaveValue("un café");
  await expect(screen.getByRole("textbox", { name: "What is “a tea” in French?", exact: true })).toHaveValue("un thé");
  await expect(screen.getByRole("button", { name: "Completed", exact: true })).toBeDisabled();

  await coffee.fill("");
  await expectProgress(screen, 0);
  await expect(screen.getByRole("button", { name: "Next activity", exact: true })).toBeDisabled();
  await expect(screen.getByRole("button", { name: "Complete activity", exact: true })).toBeDisabled();
  await coffee.fill("une boisson");
  await screen.getByRole("button", { name: "Complete activity", exact: true }).click();
  // Completion records an attempt, rather than pretending an incorrect answer is correct.
  await expect(screen.getByRole("status", { name: "Answer-key result", exact: true })).toContainText("Does not match the answer key");
  await expectProgress(screen, 1);
  await coffee.fill("un café");
  await screen.getByRole("button", { name: "Complete activity", exact: true }).click();
  await page.screenshot({ path: "qa/session-preparation/desktop-recall-completed.png" });

  const activities = [
    { title: "Flashcards", teach: true },
    { title: "Matching pairs", teach: false },
    { title: "Sentence construction", teach: true },
    { title: "Sentence construction", teach: false },
    { title: "Audio", teach: true },
    { title: "Written response", teach: false },
    { title: "Spoken response", teach: false },
    { title: "Lesson recap", teach: true },
  ];
  for (const [index, activity] of activities.entries()) {
    await screen.getByRole("button", { name: "Next activity", exact: true }).click();
    await expect(screen.getByRole("heading", { name: activity.title, exact: true, level: 1 })).toBeVisible();
    if (activity.title === "Matching pairs") {
      await selectChoice(page, screen.getByRole("combobox", { name: "un café", exact: true }), "a coffee");
      await selectChoice(page, screen.getByRole("combobox", { name: "un thé", exact: true }), "a tea");
    } else if (!activity.teach) {
      const label = activity.title === "Written response" ? "Your response"
        : activity.title === "Spoken response" ? "What would you say?" : "Your answer";
      await screen.getByRole("textbox", { name: label, exact: true }).fill(activity.title === "Written response"
        ? "The customer orders a coffee."
        : activity.title === "Spoken response" ? "Un café, s’il vous plaît. Je peux payer par carte ?" : "Je voudrais un café");
    }
    await screen.getByRole("button", { name: activity.teach ? "Mark as read" : "Complete activity", exact: true }).click();
    await expectProgress(screen, index + 2);
  }
  await screen.getByRole("button", { name: "Back to curriculum", exact: true }).click();
  await expect(screen.getByRole("heading", { name: "You’re ready for your conversation", exact: true })).toBeVisible();
  await expect(screen.locator(".lp-module-copy > span")).toHaveText(Array(6).fill("Complete"));
  await page.reload();
  await screen.getByRole("button", { name: "Review preparation", exact: true }).click();
  await expectProgress(screen, 9);
  await expect(screen.getByRole("button", { name: "Review activities", exact: true })).toBeVisible();
  await page.screenshot({ path: "qa/session-preparation/desktop-all-complete.png" });
});

test("preparation is isolated per booking and survives rescheduling, while cancellation and other teachers expose no activities", async ({ page }) => {
  test.setTimeout(60_000);
  await seedBookings(page);
  await page.goto(preparationUrl());
  const screen = current(page);
  await screen.getByRole("button", { name: "Start Warm-up", exact: true }).click();
  await completeWarmUp(screen);

  await page.goto(preparationUrl(secondBooking));
  await expectProgress(screen, 0);
  await screen.getByRole("button", { name: "Start Warm-up", exact: true }).click();
  await expect(screen.getByRole("textbox", { name: "What is “a coffee” in French?", exact: true })).toHaveValue("");
  await page.goto(`/?learner=1&view=web&flow=lesson&booking=${firstBooking}`);
  await expect(screen.getByRole("button", { name: "Continue preparation", exact: true })).toBeVisible();
  const oldStart = await page.evaluate(({ key, id }) => JSON.parse(localStorage.getItem(key)!).bookings.find((booking: { id: string }) => booking.id === id).start,
    { key: bookingsKey, id: firstBooking });
  await screen.getByRole("button", { name: "Reschedule", exact: true }).click();
  await screen.locator(".lw-slot").first().click();
  await screen.getByRole("button", { name: "Review new time", exact: true }).click();
  await screen.getByRole("button", { name: "Confirm new time", exact: true }).click();
  await expect(screen.getByRole("heading", { name: "You’re booked!", exact: true })).toBeVisible();
  const receipt = await page.evaluate(({ key, id }) => JSON.parse(localStorage.getItem(key)!).bookings.find((booking: { id: string }) => booking.id === id),
    { key: bookingsKey, id: firstBooking });
  expect(receipt).toMatchObject({ id: firstBooking, status: "confirmed", preparationId: "gilbert-cafe-v1" });
  expect(receipt.start).not.toBe(oldStart);
  await screen.getByRole("button", { name: "Prepare for lesson", exact: true }).click();
  await expectProgress(screen, 1);
  await screen.getByRole("button", { name: "Back to lesson", exact: true }).click();
  await expect(screen.getByRole("heading", { name: "Lesson details", exact: true })).toBeVisible();
  await expect(screen.getByRole("button", { name: "Continue preparation", exact: true })).toBeVisible();
  await screen.getByRole("button", { name: "Cancel lesson", exact: true }).click();
  await expect(screen.getByRole("heading", { name: "Cancel this lesson?", exact: true })).toBeVisible();
  await screen.getByRole("button", { name: "Cancel lesson", exact: true }).click();
  await expect(screen.locator(".lw-lesson-card")).toHaveCount(2);
  await expect(screen.getByRole("button", { name: "Prepare for lesson", exact: true })).toHaveCount(1);
  await page.goto(preparationUrl());
  await expect(screen.getByRole("heading", { name: "This lesson was cancelled", exact: true })).toBeVisible();
  await expect(screen.getByRole("button", { name: /^Start / })).toHaveCount(0);

  await page.goto(`/?learner=1&view=web&flow=lesson&booking=${otherBooking}`);
  await expect(screen).toContainText("Your teacher hasn’t added preparation for this session yet.");
  await expect(screen.getByRole("button", { name: /preparation|Prepare for lesson/i })).toHaveCount(0);
  await page.goto(preparationUrl(otherBooking));
  await expect(screen.getByRole("heading", { name: "No preparation yet", exact: true })).toBeVisible();
  await expect(screen.getByRole("button", { name: /^Start / })).toHaveCount(0);
});

test("failed preparation storage retains the answer and never reports completion before a successful retry", async ({ page }) => {
  await seedBookings(page);
  await page.goto(preparationUrl());
  const screen = current(page);
  await screen.getByRole("button", { name: "Start Warm-up", exact: true }).click();
  await page.evaluate(key => {
    const original = Storage.prototype.setItem;
    Object.defineProperty(window, "restorePreparationStorage", { configurable: true, value: () => { Storage.prototype.setItem = original; } });
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException("Storage is full", "QuotaExceededError");
      original.call(this, name, value);
    };
  }, progressKey);
  await fillWarmUp(screen);
  await expect(screen.getByRole("alert")).toContainText("could not be saved");
  await screen.getByRole("button", { name: "Complete activity", exact: true }).click();
  await expect(screen.getByRole("alert")).toContainText("your current answer is still here");
  await expectProgress(screen, 0);
  await expect(screen.getByRole("button", { name: "Next activity", exact: true })).toBeDisabled();
  await expect(screen.getByRole("button", { name: "Completed", exact: true })).toHaveCount(0);
  await expect(screen.getByRole("textbox", { name: "What is “a tea” in French?", exact: true })).toHaveValue("un thé");
  await page.screenshot({ path: "qa/session-preparation/storage-recovery.png" });
  await page.evaluate(() => (window as Window & { restorePreparationStorage: () => void }).restorePreparationStorage());
  await screen.getByRole("button", { name: "Complete activity", exact: true }).click();
  await expectProgress(screen, 1);
  await page.reload();
  await expectProgress(screen, 1);
});

for (const device of ["iphone", "pixel-10"] as const) {
  test(`${device} preparation preserves keyboard visibility, activity navigation and the workspace footer`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1100, height: 1100 });
    await seedBookings(page);
    await page.goto(preparationUrl(firstBooking, true));
    if (device === "pixel-10") {
      await page.getByTestId("device-picker").click();
      await page.getByTestId("device-option-pixel-10").click();
    }
    const screen = () => current(page, true);
    await expect(screen().getByRole("heading", { name: "Prepare for your lesson", exact: true })).toBeVisible();
    await expect(screen().locator(".lp-module-list > li")).toHaveCount(6);
    await screen().getByRole("button", { name: "Start Warm-up", exact: true }).click();
    await expectCoffeeAsset(screen());
    const coffee = screen().getByRole("textbox", { name: "What is “a coffee” in French?", exact: true });
    await coffee.fill("un café");
    const keyboard = page.getByTestId("keyboard-dock");
    await expectPhoneFieldVisible(page, coffee);
    await page.screenshot({ path: `qa/session-preparation/${device}-recall-keyboard.png` });
    const tea = screen().getByRole("textbox", { name: "What is “a tea” in French?", exact: true });
    await tea.fill("un thé");
    await expectPhoneFieldVisible(page, tea);
    await tea.blur();
    await expect(keyboard).toHaveAttribute("data-visible", "false");
    await screen().getByRole("button", { name: "Complete activity", exact: true }).click();
    await expectProgress(screen(), 1);
    const next = screen().getByRole("button", { name: "Next activity", exact: true });
    await next.scrollIntoViewIfNeeded();
    await expect(next).toBeInViewport();
    await next.click();
    await expect(screen().getByRole("heading", { name: "Flashcards", exact: true, level: 1 })).toBeVisible();
    await screen().getByRole("button", { name: "Return to curriculum", exact: true }).click();
    await expect(screen().getByRole("heading", { name: "Prepare for your lesson", exact: true })).toBeVisible();
    await expectProgress(screen(), 1);
    await expectNoOverflow(screen().locator(".lw-content"));
    const navigation = page.getByTestId("flow-fixed-footer").getByRole("navigation", { name: "Learning workspace", exact: true });
    await expect(navigation.getByRole("button")).toHaveCount(4);
    await expect(navigation.getByRole("button", { name: "Lessons", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(navigation).toBeInViewport();
    await navigation.getByRole("button", { name: "Lessons", exact: true }).click();
    await expect(screen().getByRole("heading", { name: "Your lessons", exact: true })).toBeVisible();
    await expect(keyboard).toHaveAttribute("data-visible", "false");
    await expectNoOverflow(screen().locator(".lw-content"));
  });
}
