import { test, expect, type Page } from "@playwright/test";
import { expectSelectedChoice, selectChoice } from "./helpers/select";

const current = (page: Page, mobile = false) => mobile ? page.getByTestId("flow-current") : page.locator(".lw-web-main");

test("search retains filters while sorting and opens full reviews", async ({ page }) => {
  await page.goto("/?learner=1&view=web&flow=search");
  await expect(page.locator(".lw-teacher-card")).toHaveCount(25);
  await page.screenshot({ path: "qa/usability-feedback/desktop-search.png" });
  const language = page.getByRole("combobox", { name: "Language", exact: true });
  const sorting = page.getByRole("combobox", { name: "Sort by", exact: true });
  await selectChoice(page, language, "French");
  await page.getByRole("button", { name: "In person", exact: true }).click();
  await page.getByRole("button", { name: "Tomorrow", exact: true }).click();
  await selectChoice(page, sorting, "Price (lowest to highest)");
  const prices = await page.locator(".lw-card-bottom > strong").allTextContents();
  const values = prices.map(value => Number(value.match(/\d+/)?.[0]));
  expect(values.length).toBeGreaterThan(2);
  expect(values).toEqual([...values].sort((a, b) => a - b));
  await selectChoice(page, sorting, "Rating (highest first)");
  const ratings = await page.locator(".lw-rating strong").allTextContents();
  expect(ratings.map(Number)).toEqual(ratings.map(Number).sort((a, b) => b - a));
  await page.locator(".lw-rating").first().click();
  await expect(page.getByRole("heading", { name: /^Reviews for / })).toBeVisible();
  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await expectSelectedChoice(language, "French");
  await expectSelectedChoice(sorting, "Rating (highest first)");
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
      await expect(screen().getByRole("heading", { name: "A teacher for your next step.", exact: true })).toBeVisible();
      await expect(screen().locator(".lw-teacher-card")).toHaveCount(25);
      await page.screenshot({ path: "qa/usability-feedback/mobile-search.png" });
    }
    await screen().locator(".lw-slot").first().click();
    await screen().getByRole("button", { name: "Continue to payment", exact: true }).click();
    await expect(screen().getByRole("heading", { name: "Review and pay", exact: true })).toBeVisible();
    await expect(screen()).not.toContainText(/demo|placeholder|test.card|pending|awaiting confirmation/i);
    await screen().getByRole("button", { name: /^Pay €/ }).click();
    await expect(screen().getByRole("heading", { name: "You’re booked!", exact: true })).toBeVisible();
    await screen().getByRole("button", { name: "View upcoming lessons", exact: true }).click();
    await expect(screen().getByRole("tab", { name: /^Upcoming/ })).toHaveAttribute("aria-selected", "true");
    await expect(screen().locator(".lw-lesson-card")).toHaveCount(2);
    await screen().getByRole("tab", { name: /^Ongoing/ }).click();
    await expect(screen().getByRole("button", { name: "Join lesson", exact: true })).toBeVisible();
    await screen().getByRole("tab", { name: /^Past/ }).click();
    await expect(screen().getByRole("button", { name: "Leave a review", exact: true })).toBeVisible();
    await screen().getByRole("button", { name: "Leave a review", exact: true }).click();
    const nav = mobile ? page.getByTestId("flow-fixed-footer").getByRole("navigation", { name: "Learning workspace" }) : page.getByRole("navigation", { name: "Learning workspace" });
    await expect(nav.getByRole("button")).toHaveCount(4);
    await expect(nav.getByRole("button", { name: "Lessons", exact: true })).toHaveAttribute("aria-current", "page");
    await screen().getByRole("button", { name: "5 stars", exact: true }).click();
    await screen().getByRole("textbox", { name: "Your review", exact: true }).fill("Patient explanations and useful practice.");
    await screen().getByRole("button", { name: "Save review", exact: true }).click();
    await expect(screen().getByRole("status")).toContainText("Your review is saved");
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
