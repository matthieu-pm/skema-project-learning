import { expect, test, type Locator, type Page } from "@playwright/test";

const lessonTitle = "A conversation at the café";
const current = (page: Page, mobile: boolean) => mobile
  ? page.getByTestId("flow-current")
  : page.locator(".lw-web-main");

async function expectNoOverflow(scope: Locator) {
  // A FlowStack pop briefly keeps the outgoing screen mounted for its transition.
  await expect(scope).toHaveCount(1);
  expect(await scope.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
}

async function goBack(page: Page) {
  await page.getByRole("button", { name: "Go back", exact: true }).click();
}

for (const presentation of ["desktop", "iphone", "pixel-10"] as const) {
  test(`${presentation} public lesson preview preserves teacher details, booking, reviews and messaging`, async ({ page }) => {
    test.setTimeout(60_000);
    const mobile = presentation !== "desktop";
    await page.setViewportSize(mobile ? { width: 1100, height: 1100 } : { width: 1440, height: 1000 });
    await page.goto(`/?learner=1&view=${mobile ? "mobile" : "web"}&flow=search`);
    if (presentation === "pixel-10") {
      await page.getByTestId("device-picker").click();
      await page.getByTestId("device-option-pixel-10").click();
    }
    const screen = () => current(page, mobile);
    const query = screen().getByRole("textbox", { name: "Search teachers", exact: true });
    await query.fill("Gilbert");
    await query.blur();
    await expect(screen().locator(".lw-teacher-card")).toHaveCount(1);
    await screen().getByRole("button", { name: "View profile", exact: true }).click();
    await expect(screen().getByRole("heading", { name: "Gilbert", exact: true, level: 1 })).toBeVisible();
    await expect(screen().getByRole("button", { name: "Book a lesson", exact: true })).toBeInViewport();
    await expect(screen().getByRole("button", { name: "Send a message", exact: true })).toBeInViewport();
    await expect(screen().getByRole("heading", { name: "Choose a lesson time", exact: true })).toBeVisible();
    expect(await screen().locator(".lw-slot").count()).toBeGreaterThan(0);
    const publicLessons = screen().getByRole("region", { name: "Lessons with Gilbert", exact: true });
    await expect(screen().getByRole("heading", { name: lessonTitle, exact: true })).toBeVisible();
    await expect(publicLessons).toContainText("French");
    await expect(publicLessons).toContainText("A2");
    await expect(publicLessons).toContainText("6 modules");
    await expect(publicLessons).toContainText("9 blocks");
    await expect(publicLessons).toContainText("30 min");
    await publicLessons.getByRole("button", { name: "View lesson details", exact: true }).click();

    await expect(screen().getByRole("heading", { name: lessonTitle, exact: true, level: 1 })).toBeVisible();
    await expect(screen()).toContainText("French");
    await expect(screen()).toContainText("A2");
    await expect(screen()).toContainText("6 modules");
    await expect(screen()).toContainText("30 min");
    await expect(screen()).not.toContainText(/Your course|Continue learning|enrol(?:l)?ed|\d+% complete/i);
    const overview = screen().getByRole("tab", { name: "Overview", exact: true });
    const curriculum = screen().getByRole("tab", { name: "Curriculum", exact: true });
    await expect(overview).toHaveAttribute("aria-selected", "true");
    const overviewPanel = screen().getByRole("tabpanel", { name: "Overview", exact: true });
    await expect(overviewPanel).toContainText("Practice useful words");
    for (const outcome of ["Order a drink politely", "Ask a natural follow-up question", "Try it in your own words"]) {
      await expect(overviewPanel.getByText(outcome, { exact: true })).toBeVisible();
    }

    // Tabs are usable without a pointer on desktop; phones retain direct tap access.
    if (mobile) await curriculum.click();
    else {
      await overview.focus();
      await overview.press("End");
      await expect(curriculum).toBeFocused();
    }
    await expect(curriculum).toHaveAttribute("aria-selected", "true");
    const curriculumPanel = screen().getByRole("tabpanel", { name: "Curriculum", exact: true });
    for (const module of ["Warm-up", "Vocabulary", "Grammar", "Listening", "Speaking", "Reflection"]) {
      await expect(curriculumPanel.getByText(module, { exact: true })).toBeVisible();
    }
    await expect(curriculumPanel.getByRole("listitem")).toHaveCount(6);
    const blockCounts = await curriculumPanel.getByText(/^\d+ blocks?$/).allTextContents();
    expect(blockCounts.reduce((total, label) => total + Number(label.match(/\d+/)?.[0]), 0)).toBe(9);
    const warmUp = curriculumPanel.getByLabel("Preview Warm-up module", { exact: true });
    const preview = curriculumPanel.getByText("Vocabulary recall · Practice", { exact: true });
    await expect(preview).toBeVisible();
    await warmUp.click();
    await expect(preview).toBeHidden();
    await warmUp.press("Enter");
    await expect(preview).toBeVisible();
    await expectNoOverflow(screen().locator(".lw-content"));

    // Booking this public outline still opens the teacher's ordinary time selection.
    await screen().getByRole("button", { name: "Book a lesson", exact: true }).click();
    await expect(screen().getByRole("heading", { name: "Choose your lesson", exact: true })).toBeVisible();
    await expect(screen()).toContainText("One-to-one with Gilbert.");
    await expect(screen().getByRole("button", { name: "Continue to payment", exact: true })).toBeDisabled();
    await expect(screen().locator(".lw-total")).toContainText("30 minutes");
    await expect(screen().locator(".lw-total")).toContainText("€30");
    await goBack(page);
    await expect(screen().getByRole("heading", { name: lessonTitle, exact: true, level: 1 })).toBeVisible();
    await screen().getByRole("button", { name: "Back to teacher profile", exact: true }).click();

    await expect(screen().getByRole("heading", { name: "Gilbert", exact: true, level: 1 })).toBeVisible();
    await screen().getByRole("button", { name: "Read all reviews", exact: true }).click();
    await expect(screen().getByRole("heading", { name: "Reviews for Gilbert", exact: true })).toBeVisible();
    await expect(screen().locator(".lw-review-card")).toHaveCount(3);
    await goBack(page);
    await expect(screen().getByRole("heading", { name: "Gilbert", exact: true, level: 1 })).toBeVisible();
    await screen().getByRole("button", { name: "Book a lesson", exact: true }).click();
    await expect(screen().getByRole("heading", { name: "Choose your lesson", exact: true })).toBeVisible();
    await goBack(page);
    await screen().getByRole("button", { name: "Send a message", exact: true }).click();
    await expect(screen().getByRole("heading", { name: "Message Gilbert", exact: true })).toBeVisible();
    const message = screen().getByRole("textbox", { name: "Your message", exact: true });
    await message.fill("Can we practice ordering at a café?");
    if (mobile) {
      const keyboard = page.getByTestId("keyboard-dock");
      await expect(keyboard).toHaveAttribute("data-visible", "true");
      await expect.poll(async () => {
        const field = await message.boundingBox();
        const dock = await keyboard.boundingBox();
        return !!field && !!dock && field.y + field.height <= dock.y + 1;
      }).toBe(true);
      await message.blur();
      await expect(keyboard).toHaveAttribute("data-visible", "false");
    }
    await screen().getByRole("button", { name: "Send message", exact: true }).click();
    await expect(screen().locator(".lw-message-bubble")).toHaveText("Can we practice ordering at a café?");
    await goBack(page);
    await expect(screen().getByRole("heading", { name: "Gilbert", exact: true, level: 1 })).toBeVisible();
    await expectNoOverflow(screen().locator(".lw-content"));
    if (mobile) {
      const navigation = page.getByTestId("flow-fixed-footer").getByRole("navigation", { name: "Learning workspace", exact: true });
      await expect(navigation.getByRole("button")).toHaveCount(4);
      await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
    } else {
      await goBack(page);
      await query.fill("Yuki");
      await screen().getByRole("button", { name: "View profile", exact: true }).click();
      await expect(screen().getByRole("heading", { name: "Yuki Tanaka", exact: true, level: 1 })).toBeVisible();
      await expect(screen().getByRole("button", { name: "View lesson details", exact: true })).toHaveCount(0);
    }
  });
}
