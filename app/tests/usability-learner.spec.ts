import { test, expect, type Page } from "@playwright/test";

const current = (page: Page, mobile = false) => mobile ? page.getByTestId("flow-current") : page.locator(".lw-web-main");

test("search retains filters while sorting and opens full reviews", async ({ page }) => {
  await page.goto("/?learner=1&view=web&flow=search");
  await expect(page.locator(".lw-teacher-card")).toHaveCount(25);
  await page.screenshot({ path: "qa/usability-feedback/desktop-search.png" });
  await page.getByLabel("Language", { exact: true }).selectOption("French");
  await page.getByRole("button", { name: "In person", exact: true }).click();
  await page.getByRole("button", { name: "Tomorrow", exact: true }).click();
  await page.getByLabel("Sort by").selectOption("Price (lowest to highest)");
  const prices = await page.locator(".lw-card-bottom > strong").allTextContents();
  const values = prices.map(value => Number(value.match(/\d+/)?.[0]));
  expect(values.length).toBeGreaterThan(2);
  expect(values).toEqual([...values].sort((a, b) => a - b));
  await page.getByLabel("Sort by").selectOption("Rating (highest first)");
  const ratings = await page.locator(".lw-rating strong").allTextContents();
  expect(ratings.map(Number)).toEqual(ratings.map(Number).sort((a, b) => b - a));
  await page.locator(".lw-rating").first().click();
  await expect(page.getByRole("heading", { name: /^Reviews for / })).toBeVisible();
  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await expect(page.getByLabel("Language", { exact: true })).toHaveValue("French");
  await expect(page.getByLabel("Sort by")).toHaveValue("Rating (highest first)");
  await expect(page.getByRole("button", { name: "Tomorrow", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "View profile", exact: true }).first().click();
  await expect(page.getByRole("button", { name: "Send a message", exact: true })).toBeInViewport();
});

for (const mobile of [false, true]) {
  test(`${mobile ? "phone" : "desktop"} instant booking leads directly to Upcoming and preserves lesson navigation`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(`/?learner=1&view=${mobile ? "mobile" : "web"}&flow=search`);
    const screen = () => current(page, mobile);
    if (mobile) {
      await expect(screen().getByRole("heading", { name: "Find a teacher", exact: true })).toBeVisible();
      await expect(screen().locator(".lw-teacher-card")).toHaveCount(25);
      await page.screenshot({ path: "qa/usability-feedback/mobile-search.png" });
    }
    await screen().locator(".lw-slot").first().click();
    // A multilingual teacher needs an explicit lesson language before payment.
    const language = screen().getByRole("group", { name: "Lesson language" });
    if (await language.count()) await language.getByRole("button").first().click();
    await screen().getByRole("button", { name: "Continue to payment", exact: true }).click();
    await expect(screen().getByRole("heading", { name: "Review and pay", exact: true })).toBeVisible();
    await expect(screen()).not.toContainText(/demo|placeholder|test.card|pending|awaiting confirmation/i);
    // On phones the pay action sits in a fixed checkout footer above the tab bar.
    const pay = (mobile ? page.getByRole("region", { name: "Payment" }) : screen()).getByRole("button", { name: /^Pay €/ });
    await expect(pay).toBeInViewport();
    await pay.click();
    await expect(screen().getByRole("heading", { name: "You’re booked!", exact: true })).toBeVisible();
    if (mobile) await expect(page.getByRole("region", { name: "Payment" })).toHaveCount(0);
    await screen().getByRole("button", { name: "View your lessons", exact: true }).click();
    // One list of lessons (live, upcoming, completed) beside a calendar tab.
    await expect(screen().getByRole("tab", { name: /^Your lessons/ })).toHaveAttribute("aria-selected", "true");
    await expect(screen().locator(".lw-lesson-card")).toHaveCount(4);
    await expect(screen().locator(".lw-lesson-upcoming")).toHaveCount(2);
    await expect(screen().getByRole("button", { name: "Join lesson", exact: true })).toBeVisible();
    // A completed lesson card has two actions; reviewing happens from its recap.
    const completed = screen().locator(".lw-lesson-past");
    await expect(completed.getByRole("button", { name: "View recap", exact: true })).toBeVisible();
    await expect(completed.getByRole("button", { name: "Book again", exact: true })).toBeVisible();
    await expect(completed.locator(".lw-lesson-actions .lw-button")).toHaveCount(2);
    await expect(completed.locator(".lw-preparation-summary")).toHaveCount(0);
    await screen().getByRole("tab", { name: "Your calendar", exact: true }).click();
    // Same calendar component as the teacher workspace.
    await expect(screen().locator(".tw-full-calendar")).toBeVisible();
    await expect(screen().locator(".tw-cal-month-event, .tw-cal-timed-event").first()).toBeVisible();
    await screen().getByRole("tab", { name: /^Your lessons/ }).click();
    await completed.getByRole("button", { name: "View recap", exact: true }).click();
    await screen().getByRole("button", { name: "Leave a review", exact: true }).click();
    const nav = mobile ? page.getByTestId("flow-fixed-footer").getByRole("navigation", { name: "Learning workspace" }) : page.getByRole("navigation", { name: "Learning workspace" });
    await expect(nav.getByRole("button")).toHaveCount(4);
    await expect(nav.getByRole("button", { name: "Lessons", exact: true })).toHaveAttribute("aria-current", "page");
    await screen().getByRole("button", { name: "5 stars", exact: true }).click();
    await screen().getByRole("textbox", { name: "Your review", exact: true }).fill("Patient explanations and useful practice.");
    await screen().getByRole("button", { name: "Save review", exact: true }).click();
    await expect(screen().getByRole("status")).toContainText("Review saved");
    // Profile now sits in the top-right corner; Messages took its place in the tab bar.
    await expect(nav.getByRole("button", { name: "Messages", exact: true })).toBeVisible();
    await page.locator(".lw-profile-button").last().click();
    await expect(screen().getByRole("heading", { name: "Your learning profile", exact: true })).toBeVisible();
    await expect.poll(() => screen().locator(".lw-learner-profile img").evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    await page.screenshot({ path: `qa/usability-feedback/${mobile ? "mobile" : "desktop"}-learner-profile.png` });
    if (mobile) {
      const widths = await screen().locator(".lw-content").evaluate(element => ({ client: element.clientWidth, scroll: element.scrollWidth }));
      expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
    }
  });
}

test("two tabs cannot book the same time and a stale checkout returns to slot selection", async ({ context }) => {
  const first = await context.newPage(), second = await context.newPage();
  for (const page of [first, second]) {
    await page.goto("/?learner=1&view=web&flow=search");
    await page.getByRole("textbox", { name: "Search teachers", exact: true }).fill("Gilbert");
    await page.locator(".lw-slot").first().click();
    await page.getByRole("button", { name: "Continue to payment", exact: true }).click();
  }
  await first.getByRole("button", { name: /^Pay €/ }).click();
  await expect(first.getByRole("heading", { name: "You’re booked!", exact: true })).toBeVisible();
  await second.getByRole("button", { name: /^Pay €/ }).click();
  await expect(second.getByRole("alert")).toContainText("no longer available");
  await expect(second.getByRole("alert")).toContainText("no payment was taken");
  await second.getByRole("button", { name: "Choose another time", exact: true }).click();
  await expect(second.getByRole("heading", { name: "Choose your lesson", exact: true })).toBeVisible();
});
