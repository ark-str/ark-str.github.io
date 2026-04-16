import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const storageKey = "ark-str:reader-bootstrap:v1";
const preferencesKey = "ark-str:app-preferences:v1";

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

test.describe("bootstrap home smoke", () => {
  test("persists preferences without browser errors", async ({ page }) => {
    const browserErrors = trackBrowserErrors(page);

    await page.goto("/");
    await page.evaluate((key) => {
      window.localStorage.removeItem(key);
    }, storageKey);
    await page.reload();

    await expect(page.getByTestId("bootstrap-shell")).toBeVisible();
    await expect(page.getByTestId("locale-select")).toBeEnabled();
    await expect(page.getByTestId("locale-select")).toHaveValue("ko-KR");
    await expect(page.getByTestId("note-input")).toHaveValue("");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.getByTestId("locale-select").selectOption("en-US");
    await page.getByTestId("note-input").fill("Preserve the root-first harness structure.");
    await page.getByTestId("onboarding-toggle").check();
    await page.getByTestId("theme-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.reload();

    await expect(page.getByTestId("locale-select")).toHaveValue("en-US");
    await expect(page.getByTestId("note-input")).toHaveValue(
      "Preserve the root-first harness structure.",
    );
    await expect(page.getByTestId("onboarding-toggle")).toBeChecked();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByTestId("theme-value")).toHaveText("dark");

    await page.getByTestId("reset-preferences-button").click();

    await expect(page.getByTestId("locale-select")).toHaveValue("ko-KR");
    await expect(page.getByTestId("note-input")).toHaveValue("");
    await expect(page.getByTestId("onboarding-toggle")).not.toBeChecked();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    browserErrors.assertClean();
  });

  test("recovers from malformed persisted state without browser errors", async ({ page }) => {
    const browserErrors = trackBrowserErrors(page);

    await page.goto("/");
    await page.evaluate((key) => {
      window.localStorage.setItem(key, "{broken-json");
    }, storageKey);
    await page.evaluate((key) => {
      window.localStorage.setItem(key, "{broken-json");
    }, preferencesKey);
    await page.reload();

    await expect(page.getByTestId("bootstrap-shell")).toBeVisible();
    await expect(page.getByTestId("locale-select")).toBeEnabled();
    await expect(page.getByTestId("locale-select")).toHaveValue("ko-KR");
    await expect(page.getByTestId("note-input")).toHaveValue("");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.getByTestId("theme-value")).toHaveText("light");

    browserErrors.assertClean();
  });
});
