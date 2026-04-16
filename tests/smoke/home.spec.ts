import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const storageKey = "ark-str:harness-workspace:v1";
const defaultGoal =
  "Ship a self-contained single-page experience that an autonomous agent can extend safely.";

function trackBrowserErrors(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  return {
    assertClean() {
      expect(consoleErrors, "unexpected browser console errors").toEqual([]);
      expect(pageErrors, "unexpected uncaught browser errors").toEqual([]);
    },
  };
}

test.describe("home smoke", () => {
  test("renders and persists local state without browser errors", async ({ page }) => {
    const browserErrors = trackBrowserErrors(page);

    await page.goto("/");

    await page.evaluate((key) => {
      window.localStorage.removeItem(key);
    }, storageKey);

    await page.reload();

    await expect(page.getByTestId("harness-dashboard")).toBeVisible();
    await expect(page.getByTestId("goal-input")).toBeVisible();
    await expect(page.getByTestId("notes-input")).toBeVisible();

    await page.getByTestId("goal-input").fill("Strict smoke goal");
    await page.getByTestId("notes-input").fill("Persist this note");
    await page.getByTestId("checklist-checkbox-bundled-only").check();

    await page.reload();

    await expect(page.getByTestId("goal-input")).toHaveValue("Strict smoke goal");
    await expect(page.getByTestId("notes-input")).toHaveValue("Persist this note");
    await expect(page.getByTestId("checklist-checkbox-bundled-only")).toBeChecked();

    await page.getByTestId("reset-workspace-button").click();

    await expect(page.getByTestId("goal-input")).toHaveValue(defaultGoal);
    await expect(page.getByTestId("notes-input")).toHaveValue("");
    await expect(page.getByTestId("checklist-checkbox-bundled-only")).not.toBeChecked();

    browserErrors.assertClean();
  });

  test("recovers from malformed persisted state without browser errors", async ({ page }) => {
    const browserErrors = trackBrowserErrors(page);

    await page.goto("/");

    await page.evaluate((key) => {
      window.localStorage.setItem(key, "{broken-json");
    }, storageKey);

    await page.reload();

    await expect(page.getByTestId("harness-dashboard")).toBeVisible();
    await expect(page.getByTestId("goal-input")).toHaveValue(defaultGoal);
    await expect(page.getByTestId("notes-input")).toHaveValue("");

    browserErrors.assertClean();
  });
});
