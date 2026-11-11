import { test as base, expect } from "@playwright/test";
const test = base.extend<{ browserErrors: string[] }>({
  browserErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await use(errors);
    expect(errors).toEqual([]);
  }, { auto: true }],
});
const entry = (view = "web") => `/?teacher=1&view=${view}&flow=availability`;

test("account-first sidebars keep routes, account actions, collapsed navigation and learner identity", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(entry());
  const sidebar = page.locator('.tw-cal-sidebar');
  await expect(sidebar).not.toContainText(/mimo|Teacher account|Teaching workspace/);
  await expect(sidebar.getByRole("button", { name: "Availability", exact: true })).toHaveAttribute("aria-current", "page");
  await sidebar.getByRole("button", { name: "Account menu", exact: true }).click();
  await page.getByRole("menuitem", { name: "Payout", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your teaching deserves clarity.", exact: true })).toBeVisible();
  await sidebar.getByRole("button", { name: "Lessons", exact: true }).click();
  await sidebar.getByRole("button", { name: "Lesson templates", exact: true }).click();
  await expect(sidebar.getByRole("button", { name: "Lesson templates", exact: true })).toHaveAttribute("data-active", "true");
  await page.getByRole("button", { name: "Toggle Sidebar", exact: true }).click();
  await sidebar.getByRole("button", { name: "Availability", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Availability", exact: true })).toBeVisible();
  await page.goto('/?learner=1&view=web&flow=search');
  const learner = page.locator('.lw-cal-sidebar');
  await expect(learner).not.toContainText(/mimo|Learner profile|Learning workspace/);
  await learner.getByRole('button', { name: 'Your profile', exact: true }).click();
  await expect(page.getByRole('heading', {name:'Your learning profile',exact:true})).toBeVisible();
  await page.screenshot({path:'qa/cal-sidebar-availability/learner-sidebar.png'});
});

test("weekly hours edit independently, copy only to selected days and retain existing bookings", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/?teacher=1&view=web&flow=schedule');
  await expect(page.locator('.tw-cal-timed-event').first()).toBeVisible();
  const originalSessions = await page.locator('.tw-cal-timed-event').allTextContents();
  await page.getByRole('button', {name:'Availability',exact:true}).click();
  await page.getByLabel('Monday start time 1', {exact:true}).fill('10:00');
  await expect(page.getByLabel('Tuesday start time 1', {exact:true})).toHaveValue('09:00');
  await page.getByRole('button', {name:'Add Monday time range',exact:true}).click();
  await page.getByLabel('Monday end time 1', {exact:true}).fill('12:00');
  await page.getByLabel('Monday start time 2', {exact:true}).fill('13:00');
  await page.getByLabel('Monday end time 2', {exact:true}).fill('16:00');
  await page.getByRole('button', {name:'Copy Monday hours',exact:true}).click();
  const copy = page.getByRole('dialog', {name:'Copy hours to',exact:true});
  await copy.getByLabel('Select all', {exact:true}).check();
  await copy.getByLabel('Select all', {exact:true}).uncheck();
  await copy.getByLabel('Wednesday', {exact:true}).check();
  await copy.getByLabel('Saturday', {exact:true}).check();
  await copy.getByRole('button', {name:'Apply',exact:true}).click();
  await expect(page.getByRole('switch', {name:'Wednesday availability',exact:true})).toHaveAttribute('aria-checked','true');
  await expect(page.getByLabel('Wednesday start time 2', {exact:true})).toHaveValue('13:00');
  await page.getByLabel('Wednesday start time 1', {exact:true}).fill('11:00');
  await expect(page.getByLabel('Monday start time 1', {exact:true})).toHaveValue('10:00');
  await expect(page.getByLabel('Saturday start time 1', {exact:true})).toHaveValue('10:00');
  await expect(page.getByLabel('Tuesday start time 1', {exact:true})).toHaveValue('09:00');
  await page.getByRole('button',{name:'Save availability',exact:true}).click();
  await expect(page.getByText('Changes saved',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Schedule',exact:true}).click();
  expect(await page.locator('.tw-cal-timed-event').allTextContents()).toEqual(originalSessions);
  await page.getByRole('button',{name:'Availability',exact:true}).click();
  await expect(page.getByLabel('Monday start time 1',{exact:true})).toHaveValue('10:00');
  await expect(page.getByText('Changes saved',{exact:true})).toBeVisible();
  await page.screenshot({path:'qa/cal-sidebar-availability/weekly-hours.png'});
});

test("availability validates overlaps, times, an empty week, timezone and offline saving without losing edits", async ({ page }) => {
  await page.goto(entry());
  await page.getByRole('button',{name:'Add Monday time range',exact:true}).click();
  await page.getByLabel('Monday start time 2',{exact:true}).fill('16:00');
  await page.getByRole('button',{name:'Save availability',exact:true}).click();
  await expect(page.getByText('Time ranges must not overlap.',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Remove Monday time range 2',exact:true}).click();
  await page.getByLabel('Monday end time 1',{exact:true}).fill('08:00');
  await page.getByRole('button',{name:'Save availability',exact:true}).click();
  await expect(page.getByText('End time must be after start time.',{exact:true})).toBeVisible();
  await page.getByLabel('Monday end time 1',{exact:true}).fill('17:00');
  await page.getByLabel('Time zone',{exact:true}).selectOption('Asia/Tokyo');
  await page.getByRole('button',{name:'Save availability',exact:true}).click();
  await expect(page.getByText(/This preview supports Europe\/Paris/)).toBeVisible();
  await expect(page.getByText('Changes saved',{exact:true})).toHaveCount(0);
  await page.getByLabel('Time zone',{exact:true}).selectOption('Europe/Paris');
  for (const day of ['Monday','Tuesday','Thursday','Friday']) await page.getByRole('switch',{name:`${day} availability`,exact:true}).click();
  await page.getByRole('button',{name:'Save availability',exact:true}).click();
  await expect(page.getByText('Choose at least one teaching day.',{exact:true})).toBeVisible();
  await page.getByRole('switch',{name:'Monday availability',exact:true}).click();
  await page.getByLabel('Monday start time 1',{exact:true}).fill('10:00');
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('switch',{name:'Connection available',exact:true}).click();
  await page.getByRole('button',{name:'Availability',exact:true}).click();
  await page.getByRole('button',{name:'Save availability',exact:true}).click();
  await expect(page.getByText(/Connection unavailable/)).toBeVisible();
  await expect(page.getByText('Changes saved',{exact:true})).toHaveCount(0);
  await expect(page.getByLabel('Monday start time 1',{exact:true})).toHaveValue('10:00');
});

for (const pixel of [false, true]) {
  test(`${pixel ? 'Pixel' : 'iPhone'} availability supports independent hours and phone-scoped copy controls`, async ({ page }) => {
    await page.goto(entry('mobile'));
    if (pixel) { await page.getByTestId('device-picker').click(); await page.getByTestId('device-option-pixel-10').click(); }
    const current = page.getByTestId('flow-current');
    await current.getByLabel('Monday start time 1',{exact:true}).fill('10:00');
    await current.getByRole('button',{name:'Copy Monday hours',exact:true}).click();
    const sheet = page.getByRole('dialog',{name:'Copy hours to',exact:true});
    await expect(sheet).toBeVisible();
    await expect(page.getByTestId('keyboard-dock')).toHaveAttribute('data-visible','false');
    await sheet.getByLabel('Wednesday',{exact:true}).check();
    await sheet.getByRole('button',{name:'Apply',exact:true}).click();
    await expect(current.getByLabel('Wednesday start time 1',{exact:true})).toHaveValue('10:00');
    await current.getByRole('button',{name:'Save availability',exact:true}).click();
    await expect(current.getByText('Changes saved',{exact:true})).toBeVisible();
    const widths = await current.locator('.tw-content').evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth}));
    expect(widths.scrollWidth).toBeLessThanOrEqual(widths.width + 1);
    await page.screenshot({path:`qa/cal-sidebar-availability/${pixel ? 'pixel' : 'iphone'}.png`});
  });
}

test('narrow web navigation opens, links to availability and closes the drawer', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?teacher=1&view=web');
  await page.getByRole('button',{name:'Toggle Sidebar',exact:true}).click();
  const drawer = page.getByRole('dialog');
  await drawer.getByRole('button',{name:'Availability',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Availability',exact:true})).toBeVisible();
  await expect(drawer).toHaveCount(0);
  expect(await page.locator('.av-page').evaluate(el=>el.scrollWidth <= el.clientWidth)).toBe(true);
});
