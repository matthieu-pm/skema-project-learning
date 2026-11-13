import { expect, test } from "@playwright/test";

for (const presentation of ["web", "mobile"] as const) {
  test(`${presentation} learner setup preserves confidence, free-text challenges, multiple goals and formats`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(`/?view=${presentation}`);

    const current = () => presentation === "web"
      ? page.getByTestId("web-onboarding-current")
      : page.getByTestId("flow-current");
    const expectStep = async (step: string) => {
      // Popped screens retain their last attributes while their exit finishes.
      await expect(current()).toHaveCount(1);
      await expect(current().locator(`.onboarding-content[data-step="${step}"]`)).toBeVisible();
    };
    const action = (name: string) => presentation === "web"
      ? current().getByRole("button", { name, exact: true })
      : page.getByTestId("flow-fixed-footer").getByRole("button", { name, exact: true });
    const proceed = async (step: string) => {
      await action("Continue").click();
      await expectStep(step);
    };
    const choice = (name: string) => current().getByRole("button", { name, exact: true });

    await action("Get started").click();
    // Choose learn or teach first, then create an account or log in.
    await expectStep("role");
    await current().getByRole("button", { name: /I want to learn/ }).click();
    await proceed("entry");
    await current().getByRole("button", { name: /^Create an account/ }).click();
    await expectStep("account");
    await current().getByRole("button", { name: "Continue with Google", exact: true }).click();
    await expectStep("google-connect");
    await action("Continue as Alex").click();
    await expectStep("age");
    await choice("18 or older").click();
    await proceed("language");
    await choice("Spanish").click();
    await proceed("level");
    await current().getByRole("button", { name: /^A1 / }).click();
    // Optional screens (confidence, challenges, preferences, extras, ID) are now in Profile.
    await proceed("learner-goal");
    await expect(action("Continue")).toBeDisabled();
    await choice("Travel").click();
    await choice("Work").click();
    await expect(choice("Travel")).toHaveAttribute("aria-pressed", "true");
    await choice("Travel").click();
    await expect(choice("Travel")).toHaveAttribute("aria-pressed", "false");
    await choice("Work").click();
    await expect(action("Continue")).toBeDisabled();
    const goal = current().getByRole("textbox", { name: "My goal in my own words (optional)", exact: true });
    await goal.fill("Order a meal confidently.");
    await goal.blur();
    await choice("Travel").click();
    await choice("Work").click();
    await proceed("learner-ready");
    await expect(current()).toContainText("Travel · Work");
    await expect(current()).toContainText("Order a meal confidently.");
    await expect(current()).not.toContainText(/preview|sample/i);
    await action("Find a teacher").click();
    await expect(page.locator(`.learner-${presentation}`)).toBeVisible();
    // One tap from the setup summary lands on teacher results with the setup language applied and removable.
    await expect(page.getByRole("heading", { name: "Find a teacher", exact: true }).last()).toBeVisible();
    await expect(page.getByLabel("Applied filters").last()).toContainText("Spanish");
    await expect(page.getByRole("button", { name: "Remove filter: Spanish" }).last()).toBeVisible();
  });
}

for (const presentation of ["web", "mobile"] as const) {
  test(`${presentation} returning learner logs in with Google and lands on Home`, async ({ page }) => {
    await page.goto(`/?view=${presentation}`);
    const current = () => presentation === "web" ? page.getByTestId("web-onboarding-current") : page.getByTestId("flow-current");
    const start = presentation === "web" ? current() : page.getByTestId("flow-fixed-footer");
    await start.getByRole("button", { name: "Get started", exact: true }).click();
    await current().getByRole("button", { name: /I want to learn/ }).click();
    await start.getByRole("button", { name: "Continue", exact: true }).click();
    await current().getByRole("button", { name: /^Log in/ }).click();
    await expect(current().getByRole("heading", { name: "Welcome back", exact: true })).toBeVisible();
    await current().getByRole("button", { name: "Continue with Google", exact: true }).click();
    await expect(page.locator(`.learner-${presentation}`)).toBeVisible();
    await expect(page.getByRole("heading", { name: "A little conversation goes a long way", exact: true }).last()).toBeVisible();
  });
}
