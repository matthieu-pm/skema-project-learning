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
    await expectStep("role");
    await current().getByRole("button", { name: /I want to learn/ }).click();
    await proceed("account");
    await current().getByRole("button", { name: "Continue with Google", exact: true }).click();
    await expectStep("google-connect");
    await action("Continue with this account").click();
    await expectStep("age");
    await choice("18 or older").click();
    await proceed("language");
    await choice("Spanish").click();
    await proceed("level");
    await current().getByRole("button", { name: /^A1 / }).click();
    await proceed("learner-confidence");

    await expect(current()).toContainText("How confident do you feel speaking Spanish?");
    await expect(action("Continue")).toBeDisabled();
    await current().getByRole("button", { name: /^I’m finding my confidence/ }).click();
    await proceed("learner-challenges");
    for (const label of ["Fear of mistakes", "Finding the right words", "Understanding replies", "Pronunciation"]) {
      await expect(choice(label)).toHaveAttribute("aria-pressed", "false");
    }
    const challenge = current().getByRole("textbox", { name: "Something else? Tell us in your own words (optional)", exact: true });
    await challenge.fill("I need more time to reply in a conversation.");
    await challenge.blur();
    if (presentation === "mobile") {
      await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
    }
    await proceed("learner-goal");

    await page.getByRole("button", { name: "Go back", exact: true }).click();
    await expectStep("learner-challenges");
    await expect(current().getByRole("textbox", { name: "Something else? Tell us in your own words (optional)", exact: true })).toHaveValue("I need more time to reply in a conversation.");
    await proceed("learner-goal");
    await expect(action("Continue")).toBeDisabled();
    await choice("Travel").click();
    await choice("Work").click();
    await expect(choice("Travel")).toHaveAttribute("aria-pressed", "true");
    await expect(choice("Work")).toHaveAttribute("aria-pressed", "true");
    await choice("Travel").click();
    await expect(choice("Travel")).toHaveAttribute("aria-pressed", "false");
    await expect(action("Continue")).toBeEnabled();
    await choice("Work").click();
    await expect(action("Continue")).toBeDisabled();
    const goal = current().getByRole("textbox", { name: "My goal in my own words (optional)", exact: true });
    await goal.fill("Order a meal confidently.");
    await goal.blur();
    await expect(action("Continue")).toBeDisabled();
    await choice("Travel").click();
    await choice("Work").click();
    await proceed("learner-preferences");

    await choice("Online").click();
    await expect(current().getByRole("combobox", { name: "City or neighbourhood (optional)", exact: true })).toHaveCount(0);
    await choice("In person").click();
    await expect(choice("Online")).toHaveAttribute("aria-pressed", "true");
    await expect(choice("In person")).toHaveAttribute("aria-pressed", "true");
    await expect(current().getByRole("combobox", { name: "City or neighbourhood (optional)", exact: true })).toBeVisible();
    await proceed("extras");
    await proceed("identity-intro");
    await action("Finish verification later").click();
    await expectStep("learner-ready");
    await expect(current()).toContainText("Travel · Work");
    await expect(current()).toContainText("Speaking: I’m finding my confidence");
    await expect(current()).toContainText("I need more time to reply in a conversation.");
    await expect(current()).toContainText("Order a meal confidently.");
    await expect(current()).toContainText("Online & In person");
    await expect(current()).not.toContainText("Find a match");
    await action("Find a teacher").click();
    await expect(page.locator(`.learner-${presentation}`)).toBeVisible();
  });
}
