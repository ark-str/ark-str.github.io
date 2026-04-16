import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const appBasePath = process.env.PLAYWRIGHT_APP_BASE_PATH ?? "/ark-str";
const readerSessionKey = "ark-str:reader-session:v1";
const preferencesKey = "ark-str:app-preferences:v1";
const legacyBootstrapKey = "ark-str:reader-bootstrap:v1";
const generatedIndex = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "ark-str-web-app", "public", "generated", "content", "index.json"),
    "utf8",
  ),
);
const sampleStory =
  generatedIndex.stories.find((story: { server: string; bodyAvailable?: boolean }) => story.server === "kr" && story.bodyAvailable) ??
  generatedIndex.stories.find((story: { bodyAvailable?: boolean }) => story.bodyAvailable);

if (!sampleStory) {
  throw new Error("A sample reader story with bodyAvailable=true is required for smoke tests.");
}

function toAppPath(route = "") {
  const normalizedRoute = route.replace(/^\/+/, "");
  const normalizedBasePath = `/${appBasePath.replace(/^\/+|\/+$/g, "")}`;

  return normalizedRoute.length > 0
    ? `${normalizedBasePath}/${normalizedRoute}`
    : `${normalizedBasePath}/`;
}

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

test.describe("reader shell smoke", () => {
  test("opens locale archives, reads a story, and restores session without browser errors", async ({
    page,
  }) => {
    const browserErrors = trackBrowserErrors(page);

    await page.goto(toAppPath());
    await page.evaluate(([session, prefs, legacy]) => {
      window.localStorage.removeItem(session);
      window.localStorage.removeItem(prefs);
      window.localStorage.removeItem(legacy);
    }, [readerSessionKey, preferencesKey, legacyBootstrapKey]);
    await page.reload();

    await expect(page.getByTestId("bootstrap-shell")).toBeVisible();
    await expect(page.getByTestId("readiness-panel")).toBeVisible();
    await expect(page.getByTestId("locale-select")).toBeEnabled();
    await expect(page.getByTestId("locale-select")).toHaveValue("kr");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.getByTestId("server-count")).not.toHaveText("0");
    await expect(page.getByTestId("story-count")).not.toHaveText("0");

    await page.getByTestId("locale-select").selectOption("en");
    await page.getByTestId("theme-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await expect(page.getByTestId("locale-select")).toHaveValue("en");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.getByTestId("open-locale-archive-link").click();
    await expect(page).toHaveURL(/\/ark-str\/reader\/en\/$/);
    await expect(page.getByTestId("reader-shell")).toBeVisible();

    await page.goto(
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`),
    );
    await expect(page.getByTestId("reader-shell")).toBeVisible();
    await expect(page.getByTestId("story-body")).toBeVisible();
    await expect(page.getByTestId("summary-empty-state")).toBeVisible();

    await page.goto(toAppPath());
    await expect(page.getByTestId("last-visited-story")).toContainText(sampleStory.title);
    await expect(page.getByTestId("continue-reading-link")).toHaveAttribute(
      "href",
      `/ark-str/reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}/`,
    );

    browserErrors.assertClean();
  });

  test("recovers from malformed persisted state without browser errors", async ({ page }) => {
    const browserErrors = trackBrowserErrors(page);

    await page.goto(toAppPath());
    await page.evaluate(([session, prefs]) => {
      window.localStorage.setItem(session, "{broken-json");
      window.localStorage.setItem(prefs, "{broken-json");
    }, [readerSessionKey, preferencesKey]);
    await page.reload();

    await expect(page.getByTestId("bootstrap-shell")).toBeVisible();
    await expect(page.getByTestId("locale-select")).toHaveValue("kr");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.getByTestId("continue-reading-link")).toBeVisible();

    browserErrors.assertClean();
  });
});
