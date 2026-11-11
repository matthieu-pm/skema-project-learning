import { expect, test, type Locator, type Page } from "@playwright/test";
import { expectCompactWebAction, expectSetupProgress } from "./helpers/onboarding";

type Presentation = "web" | "mobile";

function onboarding(page: Page, presentation: Presentation) {
  const current = () => presentation === "web"
    ? page.getByTestId("web-onboarding-current")
    : page.getByTestId("flow-current");
  const action = (name: string) => (presentation === "web"
    ? current()
    : page.getByTestId("flow-fixed-footer"))
    .getByRole("button", { name, exact: true });
  const expectStep = async (step: string) => {
    await expect(current()).toHaveCount(1);
    await expect(current().locator(`.onboarding-content[data-step="${step}"]`)).toBeVisible();
  };
  const continueTo = async (step: string, label = "Continue") => {
    await action(label).click();
    await expectStep(step);
  };
  const choice = (name: string) => current().getByRole("button", { name, exact: true });
  const fill = async (label: string, value: string) => {
    const field = current().getByLabel(label, { exact: true });
    await field.fill(value);
    await field.blur();
    if (presentation === "mobile") {
      await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
    }
  };
  return { current, action, expectStep, continueTo, choice, fill };
}

async function reachTeacherReview(page: Page, presentation: Presentation) {
  const flow = onboarding(page, presentation);
  await page.goto(`/?view=${presentation}`);
  await flow.continueTo("role", "Get started");
  await flow.current().getByRole("button", { name: /I want to teach/ }).click();
  await flow.continueTo("account");
  await flow.current().getByRole("button", { name: "Continue with Google", exact: true }).click();
  await flow.expectStep("google-connect");
  await flow.continueTo("teacher-profile", "Continue with this account");
  await flow.fill("Display name", "Avery Martin");
  await flow.fill("Your approach, in a sentence", "Practical conversation, at your pace.");
  await flow.continueTo("teacher-subjects");
  await flow.current().getByRole("combobox", { name: "Search teaching languages", exact: true }).fill("English");
  await flow.current().getByRole("option", { name: "English", exact: true }).click();
  const english = flow.current().getByRole("group", { name: "Levels for English", exact: true });
  for (const level of ["B2", "A2", "A1", "B1"]) await english.getByRole("checkbox", { name: level, exact: true }).click();
  await flow.continueTo("teacher-lessons");
  await flow.choice("Online").click();
  await flow.choice("45 minutes").click();
  await flow.fill("Price in euros / 45 minutes (optional)", "30");
  await flow.continueTo("teacher-review");
  return flow;
}

function definition(section: Locator, label: string) {
  return section.locator("dt").filter({ hasText: label }).locator("..").locator("dd");
}

test("teacher review keeps section edits, canonical levels and optional/free lesson terms distinct", async ({ page }) => {
  test.setTimeout(60_000);
  const flow = await reachTeacherReview(page, "web");
  const languages = () => flow.current().getByRole("region", { name: "Languages and levels", exact: true });
  const lessons = () => flow.current().getByRole("region", { name: "Lesson details", exact: true });

  await expect(page.locator(".web-step-meta")).toContainText("Step 8 of 8");
  await expectSetupProgress(page, 8, 8);
  await expect(flow.current().getByRole("region", { name: "Teaching profile", exact: true })).toContainText("Avery Martin");
  await expect(definition(languages(), "English")).toHaveText("A1 · A2 · B1 · B2");
  await expect(definition(lessons(), "Lesson duration")).toHaveText("45 minutes");
  await expect(definition(lessons(), "Price per lesson")).toHaveText("€30");
  await expectCompactWebAction(page, flow.current(), "Continue to identity check");

  await flow.current().getByRole("button", { name: "Edit languages and levels", exact: true }).click();
  await flow.expectStep("teacher-subjects");
  await expect(page.locator(".web-step-meta")).toContainText("Step 6 of 8");
  await expectSetupProgress(page, 6, 8);
  const english = flow.current().getByRole("group", { name: "Levels for English", exact: true });
  for (const level of ["B2", "A2", "A1", "B1"]) await expect(english.getByRole("checkbox", { name: level, exact: true })).toBeChecked();
  await english.getByRole("checkbox", { name: "C1", exact: true }).click();
  await flow.continueTo("teacher-review", "Save and return");
  await expect(page.locator(".web-step-meta")).toContainText("Step 8 of 8");
  await expect(definition(languages(), "English")).toHaveText("A1 · A2 · B1 · B2 · C1");

  // A summary reached with Back must still enforce the edited required fields.
  await flow.current().getByRole("button", { name: "Edit profile", exact: true }).click();
  await flow.expectStep("teacher-profile");
  await flow.fill("Display name", "A");
  await expect(flow.action("Save and return")).toBeDisabled();
  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await flow.expectStep("teacher-review");
  await expect(flow.action("Continue to identity check")).toBeDisabled();
  await expect(flow.action("Finish verification later")).toBeDisabled();
  await flow.current().getByRole("button", { name: "Edit profile", exact: true }).click();
  await flow.fill("Display name", "Avery Martin");
  await flow.continueTo("teacher-review", "Save and return");

  await flow.current().getByRole("button", { name: "Edit lesson details", exact: true }).click();
  await flow.expectStep("teacher-lessons");
  await flow.choice("Set duration later").click();
  await flow.fill("Price in euros / lesson (optional)", "");
  await flow.continueTo("teacher-review", "Save and return");
  await expect(definition(lessons(), "Lesson duration")).toHaveText("Not set");
  await expect(definition(lessons(), "Price per lesson")).toHaveText("Not set");
  await expect(definition(lessons(), "Meeting format")).toHaveText("Online");

  await flow.current().getByRole("button", { name: "Edit lesson details", exact: true }).click();
  await flow.choice("30 minutes").click();
  await flow.fill("Price in euros / 30 minutes (optional)", "0");
  await expect(flow.action("Save and return")).toBeDisabled();
  const freeConfirmation = flow.current().getByRole("checkbox", { name: "I confirm that I want to offer these lessons for free.", exact: true });
  await expect(freeConfirmation).toHaveAttribute("aria-checked", "false");
  await freeConfirmation.click();
  await flow.continueTo("teacher-review", "Save and return");
  await expect(definition(lessons(), "Price per lesson")).toHaveText("Free (€0)");
  await expect(definition(lessons(), "Lesson duration")).toHaveText("30 minutes");
  await flow.action("Finish verification later").click();
  await expect(page.locator(".teacher-web")).toBeVisible();
});

test("phone teacher review keeps section edits and fixed actions usable without horizontal overflow", async ({ page }) => {
  test.setTimeout(60_000);
  const flow = await reachTeacherReview(page, "mobile");
  await expect(flow.current().getByRole("heading", { name: "Review your teaching profile", exact: true })).toBeVisible();
  await expectSetupProgress(page, 8, 8);
  const overflow = await flow.current().evaluate(element => {
    const review = element.querySelector(".teacher-profile-review") as HTMLElement;
    return { screen: element.scrollWidth - element.clientWidth, review: review.scrollWidth - review.clientWidth };
  });
  expect(overflow).toEqual({ screen: 0, review: 0 });

  const phone = await page.locator(".device-screen").boundingBox();
  for (const name of ["Continue to identity check", "Finish verification later"]) {
    const button = flow.action(name);
    await expect(button).toBeVisible();
    const bounds = await button.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(phone!.x);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(phone!.x + phone!.width + 1);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(phone!.y + phone!.height);
  }

  await flow.current().getByRole("button", { name: "Edit profile", exact: true }).click();
  await flow.expectStep("teacher-profile");
  await flow.fill("Display name", "Avery Taylor");
  await flow.continueTo("teacher-review", "Save and return");
  await expect(flow.current().getByRole("region", { name: "Teaching profile", exact: true })).toContainText("Avery Taylor");
  await flow.current().getByRole("button", { name: "Edit lesson details", exact: true }).click();
  await flow.expectStep("teacher-lessons");
  await flow.continueTo("teacher-review", "Save and return");
  await flow.continueTo("identity-intro", "Continue to identity check");
  await expectSetupProgress(page, 1, 5);
  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await flow.expectStep("teacher-review");
  await expectSetupProgress(page, 8, 8);
  await flow.action("Finish verification later").click();
  await expect(page.locator(".teacher-mobile")).toBeVisible();
});
