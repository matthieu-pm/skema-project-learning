import { expect, test, type Page } from "@playwright/test";
import { expectCompactWebAction, expectSetupProgress } from "./helpers/onboarding";

function webSetup(page: Page) {
  const current = () => page.getByTestId("web-onboarding-current");
  const action = (name: string) => current().getByRole("button", { name, exact: true });
  const expectStep = async (step: string) => {
    await expect(current().locator(`.onboarding-content[data-step="${step}"]`)).toBeVisible();
  };
  const proceed = async (step: string, name = "Continue") => {
    await action(name).click();
    await expectStep(step);
  };
  const fill = async (name: string, value: string) => {
    const field = current().getByLabel(name, { exact: true });
    await field.fill(value);
    await field.blur();
  };
  return { current, action, expectStep, proceed, fill };
}

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
    if (presentation === "web") await expectCompactWebAction(page, current(), "Continue");
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

test("compact web onboarding keeps email recovery, code validation and teacher step counts", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/?view=web");
  const flow = webSetup(page);
  await expect(page.locator(".web-step-meta")).toContainText("Choose your path");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "2");
  await flow.proceed("role", "Get started");
  await expect(page.locator(".web-step-meta")).toContainText("Choose your path");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "2");
  await flow.current().getByRole("button", { name: /I want to teach/ }).click();
  await expectSetupProgress(page, 2, 8);
  await flow.proceed("account");
  await expect(page.locator(".web-step-meta")).toContainText("Step 3 of 8");
  await expectSetupProgress(page, 3, 8);
  await flow.fill("Email address", "not-an-email");
  await expect(flow.action("Continue with email")).toBeDisabled();
  await flow.fill("Email address", "teacher@example.com");
  await flow.proceed("verify", "Continue with email");
  await expect(page.locator(".web-step-meta")).toContainText("Step 4 of 8");
  await expectSetupProgress(page, 4, 8);
  await expect(flow.current().getByRole("button", { name: /^Resend code/ })).toBeDisabled();
  await flow.action("Change email address").click();
  await flow.expectStep("account");
  await expect(flow.current().getByLabel("Email address", { exact: true })).toHaveValue("teacher@example.com");
  await flow.fill("Email address", "teacher-updated@example.com");
  await flow.proceed("verify", "Continue with email");
  await expect(flow.current()).toContainText("teacher-updated@example.com");
  await flow.fill("6-digit code", "000000");
  await flow.action("Verify & continue").click();
  await flow.expectStep("verify");
  await expect(flow.current().getByRole("alert")).toContainText("That code doesn’t match");
  await expect(page.locator(".web-step-meta")).toContainText("Step 4 of 8");
  await flow.fill("6-digit code", "481629");
  await expect(flow.current().getByRole("alert")).toHaveCount(0);
  await flow.proceed("teacher-profile", "Verify & continue");
  await expect(page.locator(".web-step-meta")).toContainText("Step 5 of 8");
  await expectSetupProgress(page, 5, 8);
  await expect(flow.action("Continue")).toBeDisabled();
  await expectCompactWebAction(page, flow.current(), "Continue");
  await page.setViewportSize({ width: 390, height: 844 });
  await expectCompactWebAction(page, flow.current(), "Continue");
});

test("compact web learner setup retains guardian handoff, document fallback and identity recovery", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/?view=web");
  const flow = webSetup(page);
  await flow.proceed("role", "Get started");
  await flow.current().getByRole("button", { name: /I want to learn/ }).click();
  await flow.proceed("account");
  await flow.action("Continue with Google").click();
  await flow.expectStep("google-connect");
  await flow.proceed("age", "Continue with this account");
  await flow.action("Under 18").click();
  await flow.proceed("guardian");
  await flow.fill("Parent or guardian’s email", "alex@example.com");
  await expect(flow.action("Continue")).toBeDisabled();
  await expect(flow.current().getByRole("alert")).toContainText("different email");
  await flow.fill("Parent or guardian’s email", "parent@example.com");
  await flow.proceed("guardian-handoff");
  await expect(flow.current()).toContainText("Hand over to your parent or guardian");
  await expect(flow.current()).toContainText("parent@example.com");
  await flow.proceed("identity-intro", "I’m the parent or guardian");
  await expect(flow.current()).toContainText("Use your own ID and selfie");
  await flow.current().getByRole("button", { name: /^Link Persona ID/ }).click();
  await flow.expectStep("persona-link");
  await flow.proceed("identity-details", "Use a document instead");
  await flow.fill("Full legal name", "Parent Example");
  await flow.fill("Date of birth", "31/04/1990");
  await expect(flow.action("Continue")).toBeDisabled();
  await expect(flow.current().getByRole("alert")).toContainText("real date");
  await flow.fill("Date of birth", "15/06/1990");
  await flow.proceed("document-details");
  await expect(flow.action("Continue")).toBeDisabled();
  await flow.fill("Document issuing country", "France");
  await flow.action("Passport").click();
  await flow.proceed("document");
  await expect(flow.action("Continue")).toBeDisabled();
  await flow.current().getByRole("button", { name: /^Add document/ }).click();
  await flow.proceed("selfie");
  await expect(flow.action("Finish identity check")).toBeDisabled();
  await flow.current().getByRole("button", { name: /^Confirm selfie/ }).click();
  await flow.proceed("language", "Finish identity check");
  await expect(flow.action("Continue")).toBeDisabled();
  await expect(flow.action("French")).toBeVisible();
});
