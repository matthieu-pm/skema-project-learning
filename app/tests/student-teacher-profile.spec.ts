import { test, expect } from "@playwright/test";

for (const mobile of [false, true]) {
  test(`${mobile ? "phone" : "desktop"} teacher profile exposes the sourced lesson details and curriculum`, async ({ page }) => {
    await page.goto(`/?learner=1&view=${mobile ? "mobile" : "web"}&flow=search`);
    const screen = () => mobile ? page.getByTestId("flow-current") : page.locator(".lw-web-main");
    await screen().getByRole("textbox", { name: "Search teachers", exact: true }).fill("Gilbert");
    await screen().getByRole("button", { name: "View profile", exact: true }).click();
    await expect(screen().getByRole("button", { name: "Book a lesson", exact: true })).toBeInViewport();
    await expect(screen().getByRole("button", { name: "Send a message", exact: true })).toBeInViewport();
    await expect(screen().getByRole("heading", { name: "Lessons & curriculum", exact: true })).toBeVisible();
    await screen().getByRole("button", { name: "View lesson details", exact: true }).click();
    await expect(screen().getByRole("heading", { name: "A conversation at the café", exact: true })).toBeVisible();
    await expect(screen().getByRole("tabpanel", { name: "Overview", exact: true })).toContainText("Ask a natural follow-up question");
    await expect(screen().getByRole("tabpanel", { name: "Overview", exact: true })).toContainText("Try it in your own words");
    const curriculumTab = screen().getByRole("tab", { name: "Curriculum", exact: true });
    await screen().getByRole("tab", { name: "Overview", exact: true }).press("ArrowRight");
    await expect(curriculumTab).toBeFocused();
    await expect(curriculumTab).toHaveAttribute("aria-selected", "true");
    const curriculum = screen().getByRole("tabpanel", { name: "Curriculum", exact: true });
    await expect(curriculum).toContainText("6 modules · 9 blocks · 30 minutes");
    await expect(curriculum.locator("details")).toHaveCount(6);
    for (const title of ["Vocabulary", "Grammar", "Listening", "Speaking", "Reflection"]) {
      await curriculum.locator("summary").filter({ hasText: title }).click();
    }
    await expect(curriculum.locator("li")).toHaveCount(9);
    await expect(curriculum.getByText("Matching pairs", { exact: true })).toBeVisible();
    await expect(curriculum.getByText("Lesson recap", { exact: true })).toBeVisible();
    await curriculumTab.press("Home");
    await expect(screen().getByRole("tab", { name: "Overview", exact: true })).toBeFocused();
    await curriculumTab.click();
    await expect(curriculum.getByText("Matching pairs", { exact: true })).toBeVisible();
    const widths = await screen().locator(".lw-content").evaluate(el => ({ client: el.clientWidth, scroll: el.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
    if (mobile) for (const name of ["Home", "Lessons", "Search", "Messages"]) await expect(page.getByTestId("flow-fixed-footer").getByRole("button", { name, exact: true })).toBeVisible();
    await screen().getByRole("button", { name: "Book with Gilbert", exact: true }).click();
    await expect(screen().getByRole("region", { name: "Choose a lesson date" })).toBeVisible();
    await expect(screen().getByRole("button", { name: "Continue to payment", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Go back", exact: true }).click();
    await screen().getByRole("button", { name: "Ask about this lesson", exact: true }).click();
    // Messaging opens the chat thread with a composer.
    await expect(page.getByRole("textbox", { name: "Message Gilbert", exact: true })).toBeVisible();
  });
}

test("public curriculum deep links and teachers without published lessons recover safely", async ({ page }) => {
  await page.goto("/?learner=1&view=web&flow=curriculum&teacherId=gilbert&section=curriculum");
  await expect(page.getByRole("tab", { name: "Curriculum", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.goto("/?learner=1&view=web&flow=teacher&teacherId=yuki");
  await expect(page.getByText(/No lesson outlines published yet/)).toBeVisible();
  await expect(page.getByRole("button", { name: "View curriculum", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Ask about lessons", exact: true }).click();
  await expect(page.getByRole("textbox", { name: /^Message / })).toBeVisible();
  await page.goto("/?learner=1&view=web&flow=curriculum&teacherId=yuki");
  await expect(page.getByRole("heading", { name: "No lesson outline published yet", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "View teacher profile", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Yuki Tanaka", exact: true })).toBeVisible();
});
