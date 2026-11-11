import { expect, type Locator, type Page } from "@playwright/test";

/** Select through the visible desktop popup or the platform-native phone control. */
export async function selectChoice(page: Page, control: Locator, label: string) {
  await expect(control).toBeVisible();
  const native = await control.evaluate(element => element.tagName === "SELECT");
  if (native) {
    await control.selectOption({ label });
  } else {
    await control.click();
    await page.getByRole("option", { name: label, exact: true }).click();
  }
}

export async function expectSelectedChoice(control: Locator, label: string) {
  const native = await control.evaluate(element => element.tagName === "SELECT");
  if (native) await expect(control.locator("option:checked")).toHaveText(label);
  else await expect(control).toContainText(label);
}
