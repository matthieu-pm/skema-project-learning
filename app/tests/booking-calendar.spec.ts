import { test, expect } from "@playwright/test";

for (const mobile of [false, true]) {
  test(`${mobile ? "phone" : "desktop"} calendar keeps slot selection consistent across dates, months and formats`, async ({ page }) => {
    await page.clock.install({ time: new Date("2026-11-29T08:00:00Z") });
    await page.goto(`/?learner=1&view=${mobile ? "mobile" : "web"}&flow=search`);
    const screen = () => mobile ? page.getByTestId("flow-current") : page.locator(".lw-web-main");
    await screen().getByRole("textbox", { name: "Search teachers", exact: true }).fill("Gilbert");
    await screen().getByRole("button", { name: "View profile", exact: true }).click();
    await screen().getByRole("button", { name: "Book a lesson", exact: true }).click();
    const calendar = () => screen().getByRole("region", { name: "Choose a lesson date" });
    const times = () => screen().getByRole("region", { name: "Available times", exact: true });
    const proceed = () => screen().getByRole("button", { name: "Continue to payment", exact: true });
    await expect(proceed()).toBeDisabled();
    await expect(calendar().getByRole("button", { name: "Previous month" })).toBeDisabled();
    await calendar().getByRole("button", { name: "Next month" }).click();
    await expect(calendar().getByRole("heading", { name: "December 2026" })).toBeVisible();
    const date = calendar().getByRole("button", { name: "Tuesday, 1 December 2026", exact: true });
    await date.press("Enter");
    await expect(times().getByRole("heading", { name: "Tue 1 Dec", exact: true })).toBeVisible();
    await times().getByRole("button", { name: "09:00", exact: true }).click();
    await expect(proceed()).toBeEnabled();
    await calendar().getByRole("button", { name: "Wednesday, 2 December 2026", exact: true }).click();
    await expect(proceed()).toBeDisabled();
    await times().getByRole("button", { name: "09:00", exact: true }).click();
    await screen().getByRole("button", { name: "In person", exact: true }).click();
    await expect(proceed()).toBeDisabled();
    await calendar().getByRole("button", { name: "Next month" }).click();
    await calendar().getByRole("button", { name: "Wednesday, 2 December 2026", exact: true }).click();
    await expect(calendar().getByRole("button", { name: "Thursday, 3 December 2026", exact: true })).toBeDisabled();
    await times().getByRole("button", { name: "09:00", exact: true }).click();
    const widths = await screen().locator(".lw-content").evaluate(el => ({ client: el.clientWidth, scroll: el.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
    await page.screenshot({ path: `qa/cal-design/${mobile ? "phone" : "desktop"}-booking.png` });
    await proceed().click();
    await expect(screen().getByRole("heading", { name: "Review and pay", exact: true })).toBeVisible();
    await expect(screen()).toContainText("In person");
  });
}
