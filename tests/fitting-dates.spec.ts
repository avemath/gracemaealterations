import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { hydrated } from "./helpers";

/**
 * The timeline guide counts its steps back from a wedding date, gives an
 * honest one-line read on the timing, and hands over a calendar file.
 */
const GUIDE = "/guides/wedding-dress-alterations-timeline";

/** A date some weeks from today (in Pittsburgh), as a date input value. */
function weeksFromToday(weeks: number): string {
  const [y, m, d] = new Date()
    .toLocaleDateString("en-CA", { timeZone: "America/New_York" })
    .split("-")
    .map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + weeks * 7));
  return date.toISOString().slice(0, 10);
}

async function open(page: Page) {
  const res = await page.goto(GUIDE);
  test.skip(res?.status() !== 200, "guide not published");
  await hydrated(page, '[data-testid="fit-date-input"]');
}

test("a date about 20 weeks out gets a full plan and a status", async ({ page }) => {
  await open(page);
  await page.getByTestId("fit-date-input").fill(weeksFromToday(20));

  await expect(page.getByTestId("fit-status")).not.toBeEmpty();
  // One line per timeline step, plus the wedding itself.
  expect(await page.getByTestId("fit-plan").locator("li").count()).toBeGreaterThanOrEqual(5);
  await expect(page.getByTestId("fit-status")).not.toContainText("\u2014");
});

test("under eight weeks reads as a rush", async ({ page }) => {
  await open(page);
  await page.getByTestId("fit-date-input").fill(weeksFromToday(3));
  await expect(page.getByTestId("fit-status")).toContainText("under eight weeks");
});

test("a past date asks to check the year", async ({ page }) => {
  await open(page);
  await page.getByTestId("fit-date-input").fill(weeksFromToday(-2));
  await expect(page.getByTestId("fit-status")).toContainText("That date has passed");
  await expect(page.getByTestId("fit-plan")).toHaveCount(0);
});

test("the date is remembered on this device", async ({ page }) => {
  await open(page);
  const date = weeksFromToday(30);
  await page.getByTestId("fit-date-input").fill(date);
  await page.reload();
  await hydrated(page, '[data-testid="fit-date-input"]');
  await expect(page.getByTestId("fit-date-input")).toHaveValue(date);
});

test("the calendar button downloads an .ics file", async ({ page }) => {
  await open(page);
  await page.getByTestId("fit-date-input").fill(weeksFromToday(20));

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Add these to my calendar" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("wedding-fittings.ics");
  const content = readFileSync((await download.path())!, "utf8");
  expect(content.startsWith("BEGIN:VCALENDAR")).toBe(true);
  expect(content).toContain("BEGIN:VEVENT");
  expect(content.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
});
