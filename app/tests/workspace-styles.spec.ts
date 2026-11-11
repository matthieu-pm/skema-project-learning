import { test, expect } from "@playwright/test";

for (const teacher of [false, true]) {
  for (const mobile of [false, true]) {
    test(`${teacher ? "teacher" : "learner"} ${mobile ? "phone" : "web"} keeps the redesign after workspace CSS loads`, async ({ page }) => {
      await page.goto(`/?${teacher ? "teacher" : "learner"}=1&view=${mobile ? "mobile" : "web"}${teacher ? "" : "&flow=search"}`);
      const root = page.locator(teacher ? ".teacher-workspace" : ".learner-workspace");
      await expect(root.locator("style[data-mimo-workspace-design]")).toHaveCount(1);
      const content = mobile ? page.getByTestId("flow-current") : root;
      const panel = content.locator(teacher ? ".tw-panel" : ".lw-panel").first();
      await expect(panel).toHaveCSS("border-top-width", "1px");
      await expect(panel).toHaveCSS("border-top-left-radius", "10px");
      if (teacher) {
        await expect(content.locator(".tw-button.tw-primary").first()).toHaveCSS("background-color", "rgb(104, 68, 217)");
        if (!mobile) {
          await expect(root.locator(".tw-web-main")).toHaveCSS("border-top-left-radius", "0px");
          await expect(root.locator('[data-slot="sidebar-group-label"]').first()).toHaveCSS("text-transform", "none");
        }
      } else {
        await expect(content.locator(".lw-teacher-card").first()).toHaveCSS("border-top-left-radius", "12px");
      }
      if (mobile) {
        const widths = await content.locator(teacher ? ".tw-content" : ".lw-content").evaluate(el => ({ client: el.clientWidth, scroll: el.scrollWidth }));
        expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
      }
    });
  }
}
