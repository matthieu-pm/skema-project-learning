import { expect, test } from "@playwright/test";

test("teacher profile shows students' reviews and ratings", async ({ page }) => {
  await page.goto("/?teacher=1&view=web&flow=profile");
  const reviews = page.locator(".tw-reviews");
  await expect(reviews.getByRole("heading", { name: "Reviews from students" })).toBeVisible();
  await expect(reviews.locator(".tw-reviews-score strong")).toHaveText(/^\d\.\d$/);
  await expect(reviews.locator(".tw-reviews-list li")).toHaveCount(3);
  await expect(reviews.getByLabel("Ratings breakdown")).toBeVisible();
});

test("ongoing module tabs scroll with the page instead of staying pinned", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/?teacher=1&view=web&flow=modules");
  const tabs = page.locator(".tw-module-views");
  await expect(tabs).toBeVisible();
  const before = (await tabs.boundingBox())!.y;
  await page.locator(".tw-content").evaluate(el => { el.scrollTop = 400; });
  await expect.poll(async () => (await tabs.boundingBox())!.y).toBeLessThan(before - 300);
});

test("booking times sit in rows under the date picker", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?learner=1&view=web&flow=teacher&teacherId=gilbert");
  await page.locator(".lw-web-main").getByRole("button", { name: "Book a lesson" }).click();
  const slots = page.locator(".lw-booking-time-list .lw-slot");
  await expect(slots.first()).toBeVisible();
  const [a, b] = [await slots.nth(0).boundingBox(), await slots.nth(1).boundingBox()];
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(2);
  expect(b!.x).toBeGreaterThan(a!.x);
});

test("inside a preparation block the header back arrow returns to the module list", async ({ page }) => {
  await page.goto("/?learner=1&view=mobile&flow=preparation&bookingId=sample-upcoming");
  await page.getByTestId("flow-current").getByRole("button", { name: /Start preparation|Continue preparation/ }).click();
  await expect(page.getByText("Return to curriculum")).toHaveCount(0);
  await page.getByRole("button", { name: "Back to modules", exact: true }).click();
  await expect(page.getByTestId("flow-current").getByRole("button", { name: /Start preparation|Continue preparation/ })).toBeVisible();
});
