import { test, expect, type Page } from "@playwright/test";
const current = (page: Page, mobile: boolean) => mobile ? page.getByTestId("flow-current") : page.locator(".lw-web-main");
for (const mobile of [false, true]) {
  test(`${mobile ? "phone" : "desktop"} preparation completes actual activities and resumes saved answers`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`/?learner=1&view=${mobile ? "mobile" : "web"}&flow=lessons`);
    const screen = () => current(page, mobile);
    const click = (name: string) => screen().getByRole("button", { name, exact: true }).click();
    const count = (value: number) => expect(screen().getByText(`${value} of 9 blocks complete`, { exact: true })).toBeVisible();
    await click("Prepare for your lesson"); await count(0); await click("Start preparation");
    // Navigation alone cannot complete an activity.
    await click("Next block"); await count(0); await click("Previous");
    await expect(screen().getByRole("button", { name: "Reveal answer", exact: true })).toHaveCount(0);
    await screen().getByRole("textbox", { name: "What is “a coffee” in French?", exact: true }).fill("un café");
    await click("Submit answer"); await click("Reveal answer"); await count(0);
    await click("Next card");
    await screen().getByRole("textbox", { name: "What is “a tea” in French?", exact: true }).fill("un thé");
    await click("Submit answer"); await click("Reveal answer"); await count(1); await click("Next block");
    await expect(screen().getByRole("button", { name: "Mark as complete", exact: true })).toBeDisabled();
    await click("Reveal meaning"); await click("Next card"); await click("Reveal meaning");
    await click("Mark as complete"); await count(2); await click("Next block");
    await screen().getByLabel("un café", { exact: true }).selectOption("a coffee");
    await screen().getByLabel("un thé", { exact: true }).selectOption("a tea");
    await click("Submit answer"); await click("Reveal answer"); await count(3); await click("Next block");
    await click("Mark as complete"); await count(4); await click("Next block");
    for (const word of ["Je", "voudrais", "un café"]) await click(word);
    await click("Submit answer"); await click("Reveal answer"); await count(5); await click("Next block");
    await screen().getByText("Read transcript", { exact: true }).click();
    await expect(screen().getByText(/Je voudrais un café, s’il vous plaît. Bien sûr/)).toBeVisible();
    await click("Mark as complete"); await count(6); await click("Next block");
    await screen().getByRole("textbox", { name: "Your response", exact: true }).fill("The customer orders a coffee.");
    await click("Save response"); await count(7); await click("Next block");
    await screen().getByRole("textbox", { name: "Practice aloud, then write what you said", exact: true }).fill("Je voudrais un café. Est-ce que je peux payer par carte ?");
    await click("Save response"); await count(8); await click("Next block");
    await click("Mark as complete"); await count(9); await click("View preparation");
    await expect(screen().getByRole("heading", { name: "Your preparation is complete", exact: true })).toBeVisible();
    if (mobile) {
      await expect(page.getByTestId("flow-fixed-footer").getByRole("button")).toHaveCount(4);
      const width = await screen().locator(".lw-preparation-route").evaluate(el => ({ client: el.clientWidth, scroll: el.scrollWidth }));
      expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
    }
    await page.reload(); await click("Review preparation");
    await expect(screen().getByRole("heading", { name: "Your preparation is complete", exact: true })).toBeVisible();
    await click("Review your answers");
    await expect(screen().getByRole("textbox", { name: "What is “a coffee” in French?", exact: true })).toHaveValue("un café");
    await expect(screen().getByText("Teacher’s answer: un café", { exact: true })).toBeVisible();
  });
}
test("new bookings open preparation, draft answers survive reload and a failed save never reports completion", async ({ page }) => {
  await page.goto("/?learner=1&view=web&flow=search");
  await page.getByRole("textbox", { name: "Search teachers", exact: true }).fill("Gilbert");
  await page.locator(".lw-slot").first().click();
  await page.getByRole("button", { name: "Continue to payment", exact: true }).click();
  await page.getByRole("button", { name: /^Pay €/ }).click();
  await page.getByRole("button", { name: "Prepare for your lesson", exact: true }).click();
  await page.getByRole("button", { name: "Start preparation", exact: true }).click();
  const answer = page.getByRole("textbox", { name: "What is “a coffee” in French?", exact: true });
  await answer.fill("un caf");
  await expect(page.locator(".lw-preparation-save-status")).not.toContainText("Saving");
  await page.getByRole("button", { name: "Return to curriculum", exact: true }).click();
  await page.getByRole("button", { name: "Back to session", exact: true }).click();
  const bookingId = await page.evaluate(() => JSON.parse(localStorage.getItem("mimo.learner-bookings.v1")!).bookings.find((booking: { id: string }) => booking.id.startsWith("booking-")).id);
  await page.goto(`/?learner=1&view=web&flow=preparation&bookingId=${bookingId}`);
  await page.getByRole("button", { name: "Start preparation", exact: true }).click(); await expect(answer).toHaveValue("un caf");
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error("full"); }; });
  await answer.fill("un café");
  await expect(page.getByRole("alert")).toContainText("could not be saved");
  await expect(page.getByText("0 of 9 blocks complete", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next block", exact: true })).toBeDisabled();
  await page.reload(); await page.getByRole("button", { name: "Start preparation", exact: true }).click(); await expect(answer).toHaveValue("un caf");
});
test("unassigned, cancelled and missing sessions have explicit preparation recovery", async ({ page }) => {
  await page.goto("/?learner=1&view=web&flow=preparation&bookingId=sample-past");
  await expect(page.getByRole("heading", { name: "No preparation assigned yet", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ask your teacher", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Message Emma", exact: true })).toBeVisible();
  await page.goto("/?learner=1&view=web&flow=lessons"); await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Cancel lesson", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No upcoming lessons", exact: true })).toBeVisible();
  await page.goto("/?learner=1&view=web&flow=preparation&bookingId=sample-upcoming");
  await expect(page.getByRole("heading", { name: "This session was cancelled", exact: true })).toBeVisible();
  await page.goto("/?learner=1&view=web&flow=preparation&bookingId=missing");
  await expect(page.getByRole("heading", { name: "Lesson not found", exact: true })).toBeVisible();
});

for (const pixel of [false, true]) {
  test(`${pixel ? "Pixel" : "iPhone"} preparation keeps the focused answer above the keyboard and restores fixed navigation`, async ({ page }) => {
    await page.goto("/?learner=1&view=mobile&flow=preparation&bookingId=sample-upcoming");
    if (pixel) { await page.getByTestId("device-picker").click(); await page.getByTestId("device-option-pixel-10").click(); }
    const screen = page.getByTestId("flow-current");
    await screen.getByRole("button", { name: "Start preparation", exact: true }).click();
    const answer = screen.getByRole("textbox", { name: "What is “a coffee” in French?", exact: true });
    await answer.fill("un café");
    await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "true");
    await expect.poll(async () => answer.evaluate(el => {
      const box = el.getBoundingClientRect(), keyboard = document.querySelector('[data-testid="keyboard-dock"]')!.getBoundingClientRect();
      return box.bottom <= keyboard.top + 1;
    })).toBe(true);
    await answer.blur();
    await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
    await expect(screen.getByRole("button", { name: "Next block", exact: true })).toBeInViewport();
    await expect(screen.getByRole("button", { name: "Previous", exact: true })).toBeInViewport();
    await expect(page.getByTestId("flow-fixed-footer").getByRole("button")).toHaveCount(4);
  });
}
